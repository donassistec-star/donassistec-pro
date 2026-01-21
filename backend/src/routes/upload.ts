import { Router } from "express";
import { upload } from "../middleware/upload";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import path from "path";

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

// Servir arquivos estáticos
router.use("/files", (req, res, next) => {
  const filePath = path.join(__dirname, "../../uploads", req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        error: "Arquivo não encontrado",
      });
    }
  });
});

export default router;
