import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  trigger?: React.ReactNode;
  className?: string;
}

const VideoPlayer = ({ videoUrl, title, thumbnail, trigger, className }: VideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Converte URL do YouTube para formato embed se necessário
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("embed/")) {
      return url;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => setIsOpen(true)}
    >
      <Play className="w-4 h-4 mr-2" />
      Assistir Vídeo
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl w-full p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>{title || "Vídeo Tutorial"}</DialogTitle>
            {title && (
              <DialogDescription>
                Tutorial completo de reparo e serviços disponíveis
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || "Vídeo tutorial"}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoPlayer;
