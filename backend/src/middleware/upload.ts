import multer from "multer";
import path from "path";
import fs from "fs";

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filtro de tipos de arquivo para IMAGENS
const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|ico|x-icon|vnd\.microsoft\.icon/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas! (jpeg, jpg, png, gif, webp, ico)"));
  }
};

// Filtro de tipos de arquivo para VÍDEOS
const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedVideoTypes = /mp4|webm|mov|ogg|ogv|mpeg|3gp|avi|flv|wmv|quicktime/i;
  const videoMimeTypes = /video\//i;
  
  const extname = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = videoMimeTypes.test(file.mimetype);

  if ((extname || mimetype) && file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error("Apenas vídeos são permitidos! (mp4, webm, mov, ogg, ogv, mpeg, 3gp, avi, flv, wmv)"));
  }
};

// Configuração do multer para IMAGENS
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB para imagens
  },
  fileFilter: imageFileFilter,
});

// Configuração do multer para VÍDEOS
export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB para vídeos
  },
  fileFilter: videoFileFilter,
});

// Middleware para servir arquivos estáticos
export const uploadsPath = uploadDir;
