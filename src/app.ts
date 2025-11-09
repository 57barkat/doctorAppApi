import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import CookieParser from "cookie-parser";
import httpStatus from "http-status";
import ApiError from "./errors/apiError";
import router from "./app/routes";
import config from "./config";

const app: Application = express();

// ✅ CORS configuration
const allowedOrigins = [
  "https://doctor-appfrontend.vercel.app", // live frontend
  "http://localhost:3000", // local frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies / auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight OPTIONS requests
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(CookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

app.get("/", (req: Request, res: Response) => {
  res.send(config.clientUrl);
});

// 🔹 All API routes
app.use("/api/v1", router);

// 🔹 Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
  next();
});

export default app;
