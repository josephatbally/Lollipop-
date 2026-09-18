import hashlib
from pathlib import Path
from uuid import uuid4
from .config import settings

ALLOWED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}

def storage_root() -> Path:
    root = Path(settings.media_storage_path).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root

def validate_video_signature(content_type: str, initial_bytes: bytes) -> bool:
    if content_type == "video/webm":
        return initial_bytes.startswith(b"\x1a\x45\xdf\xa3")
    if content_type in {"video/mp4", "video/quicktime"}:
        return len(initial_bytes) >= 8 and initial_bytes[4:8] == b"ftyp"
    return False

def new_storage_key(creator_id: int, filename: str, content_type: str) -> str:
    suffix = ALLOWED_VIDEO_TYPES[content_type]
    return f"creators/{creator_id}/{uuid4().hex}{suffix}"

def write_private_upload(upload, storage_key: str) -> tuple[int, str]:
    destination = storage_root() / Path(storage_key)
    destination.parent.mkdir(parents=True, exist_ok=True)
    hasher = hashlib.sha256()
    size = 0
    with destination.open("wb") as target:
        while True:
            chunk = upload.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > settings.max_media_size_bytes:
                target.close()
                destination.unlink(missing_ok=True)
                raise ValueError("Media file exceeds the configured size limit")
            hasher.update(chunk)
            target.write(chunk)
    return size, hasher.hexdigest()

def delete_private_upload(storage_key: str) -> None:
    (storage_root() / Path(storage_key)).unlink(missing_ok=True)
