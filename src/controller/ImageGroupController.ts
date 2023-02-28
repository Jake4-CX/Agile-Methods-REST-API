import { AppDataSource } from "../data-source";
import { ImageGroups } from "../entity/ImageGroups";
import { NextFunction, Request, Response } from "express"
var createError = require('http-errors');

export class ImageGroupController {

  public static imageGroupRepository = AppDataSource.getRepository(ImageGroups)

}