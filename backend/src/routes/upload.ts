import { Router } from "express";
import { upload, uploadVideo } from "../middleware/upload";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";


const router = Router();

// Upload de imagem (apenas admin)
router.post("/image", authenticateToken, requireAdmin, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhuma imagem foi enviada",
      });
    }

    // URL relativa do arquivo
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
      },
      message: "Imagem enviada com sucesso",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao fazer upload da imagem",
    });
  }
});

// Upload de vídeo (apenas admin)
router.post("/video", authenticateToken, requireAdmin, uploadVideo.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Nenhum vídeo foi enviado",
      });
    }

    // URL relativa do arquivo
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
      },
      message: "Vídeo enviado com sucesso",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao fazer upload do vídeo",
    });
  }
});

// Static files are served via express.static in index.ts (/uploads/*).
// The custom /files handler was removed to prevent path traversal attacks.

export default router;
