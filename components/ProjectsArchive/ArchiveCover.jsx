import Image from "next/image";

/**
 * A project's cover. Real image via next/image when `cover.src` is set,
 * otherwise the built-in alldystars sample poster.
 * Everything inside is sized in container units, so the same component
 * works peeking out of a file, during the zoom, and as a full-screen hero.
 */
export default function ArchiveCover({ project, priority = false, sizes = "(max-width: 767px) 92vw, 26vw" }) {
  const cover = project.cover || {};
  if (cover.src) {
    return (
      <div className="pa-cover-art">
        <Image
          src={cover.src}
          alt={cover.alt || ""}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: "cover", objectPosition: cover.position || "center" }}
        />
      </div>
    );
  }
  return (
    <div className="pa-cover-art pa-poster" role="img" aria-label={cover.alt || `${project.title} cover`}>
      <span className="pa-poster__glow" aria-hidden="true" />
      <span className="pa-poster__tag" aria-hidden="true">
        Cover · sample project
      </span>
      <span className="pa-poster__big" aria-hidden="true">
        Ideas,
        <br />
        made
      </span>
      <span className="pa-poster__script" aria-hidden="true">
        remarkable
      </span>
    </div>
  );
}
