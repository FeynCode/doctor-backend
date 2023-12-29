import { Request, Response } from "express";
import {
  EnglishSuccessLocale,
  EnglishErrorLocale,
  HindiErrorLocale,
  HindiSuccessLocale,
  acceptedLanguages,
} from "../constants/locales/index.ts";

const getLangObj = (lang: string) => {
  let successObj: Record<string, any>;
  let errorObj: Record<string, any>;
  switch (lang) {
    case "en":
      successObj = EnglishSuccessLocale;
      errorObj = EnglishErrorLocale;
      break;
    case "hi":
      successObj = HindiSuccessLocale;
      errorObj = HindiErrorLocale;
      break;
    default:
      successObj = EnglishSuccessLocale;
      errorObj = EnglishErrorLocale;
      break;
  }
  return { successObj, errorObj };
};

export const successResFormatter = async (
  status: number,
  messageCode: string,
  data: Object = {},
  _req: Request,
  _res: Response
) => {
  const lang =
    acceptedLanguages.find((lang) => _req.acceptsLanguages().includes(lang)) ||
    "en";
  let message = getLangObj(lang).successObj[messageCode];
  return _res.status(status).json({
    status,
    message,
    code: messageCode,
    data,
  });
};

export const errorResFormatter = async (
  status: number,
  messageCode: string,
  error: Object = {},
  _req: Request,
  _res: Response
) => {
  const lang =
    acceptedLanguages.find((lang) => _req.acceptsLanguages().includes(lang)) ||
    "en";
  let message = getLangObj(lang).errorObj[messageCode];
  return _res.status(status).json({
    status,
    message,
    code: messageCode,
    error,
  });
};
