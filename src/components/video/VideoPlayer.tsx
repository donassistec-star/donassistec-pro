import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMediaEmbed } from "@/utils/mediaEmbed";

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
  const media = resolveMediaEmbed(videoUrl);
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
            {media.kind === "iframe" ? (
              <iframe
                src={media.src}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || "Vídeo tutorial"}
                scrolling="no"
              />
            ) : media.kind === "video" ? (
              <video
                className="w-full h-full"
                controls
                playsInline
                preload="metadata"
              >
                <source src={media.src} type="video/mp4" />
                <source src={media.src} type="video/webm" />
                Seu navegador não suporta a reprodução de vídeo.
              </video>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
                <p className="max-w-md text-sm text-white/80">
                  Este link nao pode ser incorporado com seguranca. Abra o video em uma nova aba.
                </p>
                <Button asChild variant="secondary">
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir video
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoPlayer;
