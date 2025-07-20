import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { LoggerService } from '../../logger/logger.service';
import * as archiver from 'archiver';
import { createWriteStream, existsSync, statSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { basename, join } from 'path';
import { EnvConfiguration } from 'src/config/env.config';
import { v4 } from 'uuid';

export const PASSPORTS_URL = 'passports';

interface RequestWithLogger extends Express.Request {
  logger?: LoggerService;
}

const fileFilter = (
  req: RequestWithLogger,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file) {
    callback(null, true);
    return;
  }
  // const allowedExtensions = ['.pdf', '.heic', '.heif'];
  // const fileName = file.originalname.toLowerCase();
  // const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  // const isAllowedExtension = allowedExtensions.some((ext) =>
  //   fileExtension.endsWith(ext),
  // );

  // const isAllowed =
  //   file.mimetype.startsWith('image/') ||
  //   file.mimetype === 'application/pdf' ||
  //   isAllowedExtension;
  // if (!isAllowed) {
  //   const error = new BadRequestException('Invalid file type');
  //   // if (req.logger) {
  //   //   req.logger.log({
  //   //   });
  //   // }
  //   return callback(error, false);
  // }

  if (file.size > 1024 * 1024 * 10) {
    // 10MB limit
    const error = new BadRequestException('File size too large');
    // if (req.logger) {
    //   req.logger.log({
    //   });
    // }
    return callback(error, false);
  }

  callback(null, true);
};
const fileName = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) => {
  const fileName = file.originalname.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  const ext = file.mimetype.split('/')[1];
  const newName = `${v4()}-${Date.now()}.${fileExtension || ext}`;
  callback(null, newName);
};
const fileStorage = diskStorage({
  destination: `${EnvConfiguration().storage.static}/${PASSPORTS_URL}`,
  filename: fileName,
});
export const multerOptions: MulterOptions = {
  fileFilter: fileFilter,
  storage: fileStorage,
};

export const getStaticFilePath = (dir: string, filename: string) => {
  const staticPath = EnvConfiguration().storage.static;
  const path = join(staticPath, dir, filename);

  if (!existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }

  return path;
};
export const removeStaticFile = (dir: string, filename: string) => {
  // const path = join(__dirname, '../../../static', dir, filename);
  const staticPath = EnvConfiguration().storage.static;
  const path = join(staticPath, dir, filename);
  if (existsSync(path)) {
    try {
      unlinkSync(path);
    } catch (error) {
      console.error(`Error deleting file: ${path}`, error);
    }
  }
  return path;
};

export const createImagesZip = (
  dir: string,
  files: Map<string, string>,
): Promise<{
  zip: string;
  name: string;
}> => {
  const staticPath = EnvConfiguration().storage.static;
  const tempPath = EnvConfiguration().storage.temp;
  const zipFileName = `images_${v4()}.zip`;
  const zipFilePath = join(tempPath, zipFileName);
  const output = createWriteStream(zipFilePath);
  const archive = archiver('zip', {
    zlib: { level: 0 },
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`${archive.pointer()} bytes totales archivados.`);
      console.log(
        'Archiver ha sido finalizado y el descriptor de archivo de salida se ha cerrado.',
      );
      resolve({ zip: zipFilePath, name: basename(zipFilePath) });
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(
          'Advertencia de Archiver (archivo no encontrado):',
          err.message,
        );
      } else {
        console.error('Advertencia inesperada de Archiver:', err);
        reject(err);
      }
    });

    archive.on('error', (err) => {
      console.error('Error fatal de Archiver:', err);
    });

    archive.pipe(output);

    files.forEach((newFileName, fileName) => {
      const path = join(staticPath, dir, fileName);
      try {
        if (existsSync(path) && statSync(path).isFile()) {
          archive.file(path, { name: newFileName });
        } else {
          console.warn(
            `Archivo no encontrado o no es un archivo, saltando: ${fileName}`,
          );
        }
      } catch (error) {
        console.error(
          `Falló al añadir el archivo ${fileName} al archivo ZIP:`,
          error,
        );
      }
    });

    archive.finalize();
  });
};
