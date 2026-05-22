import { Module, Body, Controller, Headers, Injectable, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../../common/decorators/public.decorator';

class CreateRzpOrderDto { @IsString() orderId: string; }
class VerifyDto {
  @IsString() razorpayOrderId: string;
  @IsString() razorpayPaymentId: string;
  @IsString() razorpaySignature: string;
  @IsString() orderId: string;
}

@Injectable()
class PaymentsService {
  private rzp: Razorpay;
  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.rzp = new Razorpay({
      key_id: this.config.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_dummy',
      key_secret: this.config.get<string>('RAZORPAY_KEY_SECRET') || 'dummy',
    });
  }

  async createRzpOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const rzpOrder = await this.rzp.orders.create({
      amount: Math.round(Number(order.total) * 100),
      currency: order.currency,
      receipt: order.orderNumber,
    });

    await this.prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId, providerOrderId: rzpOrder.id,
        amount: order.total, currency: order.currency, status: PaymentStatus.PENDING,
      },
      update: { providerOrderId: rzpOrder.id },
    });

    return { rzpOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, key: this.config.get('RAZORPAY_KEY_ID') };
  }

  async verify(d: VerifyDto) {
    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET') || 'dummy';
    const expected = crypto.createHmac('sha256', secret)
      .update(`${d.razorpayOrderId}|${d.razorpayPaymentId}`)
      .digest('hex');

    if (expected !== d.razorpaySignature) {
      await this.prisma.payment.update({ where: { orderId: d.orderId }, data: { status: PaymentStatus.FAILED } });
      throw new BadRequestException('Signature verification failed');
    }

    await this.prisma.payment.update({
      where: { orderId: d.orderId },
      data: {
        providerPaymentId: d.razorpayPaymentId,
        providerSignature: d.razorpaySignature,
        status: PaymentStatus.SUCCESS,
      },
    });
    await this.prisma.order.update({
      where: { id: d.orderId },
      data: { paymentStatus: PaymentStatus.SUCCESS, status: OrderStatus.PAID },
    });

    return { success: true };
  }

  async webhook(rawBody: string, signature: string) {
    const secret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET') || 'dummy';
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected !== signature) throw new BadRequestException('Webhook signature invalid');
    // Process event ...
    return { ok: true };
  }
}

@ApiTags('Payments')
@Controller('payments')
class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Post('rzp/order')
  create(@Body() d: CreateRzpOrderDto) { return this.svc.createRzpOrder(d.orderId); }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Post('rzp/verify')
  verify(@Body() d: VerifyDto) { return this.svc.verify(d); }

  @Public() @Post('rzp/webhook')
  webhook(@Req() req: any, @Headers('x-razorpay-signature') sig: string) {
    const raw = req.rawBody?.toString?.() || JSON.stringify(req.body);
    return this.svc.webhook(raw, sig);
  }
}

@Module({ imports: [ConfigModule], controllers: [PaymentsController], providers: [PaymentsService] })
export class PaymentsModule {}
