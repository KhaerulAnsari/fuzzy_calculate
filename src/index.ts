import express, { type Express, type Request, type Response } from "express";
import { PORT } from "./secretes.js";
import rootRouter from "./routes/index.js";
import { PrismaClient } from "./generated/prisma/client.js";
import { errorMiddleware } from "./middlewares/errors.js";
import { startTokenCleanupSchedule } from "./utils/cleanupTokens.js";

const app: Express = express();

``;
app.use(express.json());
app.use("/api", rootRouter);
export const prismaClient = new PrismaClient({
  log: ["query"],
}).$extends({
  result: {
    // address: {
    //   formattedAddress: {
    //     needs: {
    //       lineOne: true,
    //       lineTwo: true,
    //       city: true,
    //       country: true,
    //       pincode: true,
    //     },
    //     compute: (addr) => {
    //       return `${addr.lineOne}, ${addr.lineTwo}, ${addr.city}, ${addr.country}-${addr.pincode}`;
    //     },
    //   },
    // },
  },
});

// app.get("/", (req: Request, res: Response) => {
//   res.send("Working");
// });

app.use(errorMiddleware as any);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start token cleanup schedule
  startTokenCleanupSchedule();
});
