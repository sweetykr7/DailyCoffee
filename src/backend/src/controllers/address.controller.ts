import { Request, Response, NextFunction } from 'express';
import * as addressService from '../services/address.service';

export async function getAddresses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const addresses = await addressService.getAddresses(req.user!.userId);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const address = await addressService.createAddress(
      req.user!.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const address = await addressService.updateAddress(
      req.user!.userId,
      req.params.id,
      req.body
    );

    if (!address) {
      res.status(404).json({
        success: false,
        error: 'Address not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await addressService.deleteAddress(req.user!.userId, req.params.id);

    res.json({
      success: true,
      data: { message: 'Address deleted successfully.' },
    });
  } catch (error) {
    next(error);
  }
}

export async function setDefault(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const address = await addressService.setDefault(
      req.user!.userId,
      req.params.id
    );

    res.json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
}
