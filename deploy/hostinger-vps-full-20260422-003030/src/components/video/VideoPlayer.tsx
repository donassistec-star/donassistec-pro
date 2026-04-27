import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  trigger?: React.ReactNode;
  className?: string;
}

const VideoPlayer = ({ videoUrl, title, thumbnail, trigger, className }: VideoPlayerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const isInstagramEmbed =
    videoUrl.includes("instagram.com/reel/") ||
    videoUrl.includes("instagram.com/p/") ||
    videoUrl.includes("instagram.com/tv/");

  const isVerticalYoutube = videoUrl.includes("youtube.com/shorts/");

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
    if (url.includes("youtube.com/shorts/")) {
      const videoId = url.split("youtube.com/shorts/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("embed/")) {
      return url;
    }

    if (
      url.includes("instagram.com/reel/") ||
      url.includes("instagram.com/p/") ||
      url.includes("instagram.com/tv/")
    ) {
      try {
        const parsed = new URL(url);
        const cleanPath = parsed.pathname.replace(/\/$/, "");
        return `https://www.instagram.com${cleanPath}/embed`;
      } catch {
        return url;
      }
    }

    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const isVerticalVideo = isInstagramEmbed || isVerticalYoutube;

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
        <DialogContent
          className={cn(
            "w-full p-0 gap-0 overflow-hidden",
            isVerticalVideo ? "max-w-md" : "max-w-5xl"
          )}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>{title || "Vídeo Tutorial"}</DialogTitle>
            {title && (
              <DialogDescription>
                Tutorial completo de reparo e serviços disponíveis
              </DialogDescription>
            )}
          </DialogHeader>
          <div
            className={cn(
              "relative w-full bg-black",
              isVerticalVideo ? "aspect-[9/16] max-h-[80vh]" : "aspect-video"
            )}
          >
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || "Vídeo tutorial"}
              scrolling="no"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoPlayer;
