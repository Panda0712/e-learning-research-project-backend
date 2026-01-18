import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import blogCategoryRouter from './routes/blog_category.route';
import cartRouter from './routes/cart.route';

const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use('/api/blog-categories', blogCategoryRouter);
app.use('/api/cart', cartRouter);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// handle error
// app.use((req, res, next) => {
//   const error = new Error("Not Found!");
//   error.status = 404;
//   next(error);
// });
// app.use((err, req, res, next) => {
//   const statusCode = err.status || 500;
//   const resMessage = `${err.status} - ${
//     Date.now() - err.now
//   }ms - Response: ${JSON.stringify(err)}`;
//   myLogger.error(resMessage, [
//     req.path,
//     { requestId: req.requestId },
//     { message: err.message },
//   ]);
//   return res.status(statusCode).json({
//     status: "error",
//     code: statusCode,
//     stack: err.stack,
//     message: err.message || "Internal server error!",
//   });
// });

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`-----------------------------------------`);
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`-----------------------------------------`);
});

export default app;
