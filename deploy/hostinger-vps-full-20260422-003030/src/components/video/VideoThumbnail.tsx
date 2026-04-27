import { useState } from "react";
import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import VideoPlayer from "./VideoPlayer";
import { cn } from "@/lib/utils";

interface VideoThumbnailProps {
  video: {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
    duration?: string;
  };
  className?: string;
}

const VideoThumbnail = ({ video, className }: VideoThumbnailProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <VideoPlayer
        videoUrl={video.url}
        title={video.title}
        trigger={
          <div className="relative aspect-video bg-muted/30 overflow-hidden">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <Play className="w-16 h-16 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Play Overlay */}
            <div
              className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
                hovered ? "opacity-100" : "opacity-60"
              )}
            >
              <div className="bg-white/90 rounded-full p-4 transform transition-transform duration-300 group-hover:scale-110">
                <Play className="w-8 h-8 text-primary fill-primary ml-1" />
              </div>
            </div>

            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            )}
          </div>
        }
      />

      <div className="p-4">
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {video.title}
        </h4>
      </div>
    </Card>
  );
};

export default VideoThumbnail;
