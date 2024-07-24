import uuid

import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from api.deps import CurrentUser
from core.config import settings

router = APIRouter(prefix="/upload", tags=["Upload"])

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)

allowed_content_types = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/jpg",
]


@router.post("/")
async def upload_file(_: CurrentUser, file: UploadFile = File(...)):
    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    try:
        file_content = await file.read()
        key = str(uuid.uuid4())

        s3_client.put_object(
            Body=file_content,
            Key=key,
            Bucket=settings.AWS_BUCKET_NAME,
            ContentType=file.content_type,
        )

        file_url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
        return JSONResponse({"file_url": file_url}, status_code=200)
    except (NoCredentialsError, PartialCredentialsError) as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
