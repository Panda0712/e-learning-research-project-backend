import { prisma } from "./src/lib/prisma";
import { payosService } from "./src/services/payosService";

(async () => {
  const targets = [24, 23, 21, 18, 16, 15];
  const results: any[] = [];

  for (const orderId of targets) {
    try {
      const res = await payosService.checkPaymentStatus(orderId);
      results.push({
        orderId,
        ok: true,
        paymentStatus: res?.paymentStatus,
        orderStatus: res?.orderStatus,
        isSuccess: res?.isSuccess,
      });
    } catch (e: any) {
      results.push({ orderId, ok: false, error: e?.message || String(e) });
    }
  }

  const verify = await prisma.order.findMany({
    where: { id: { in: targets } },
    orderBy: { id: "asc" },
    select: { id: true, paymentStatus: true, status: true, isSuccess: true },
  });

  console.log(JSON.stringify({ results, verify }, null, 2));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
