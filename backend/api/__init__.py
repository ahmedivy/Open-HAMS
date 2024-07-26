from fastapi import APIRouter

from .routes.admin import router as admin_router
from .routes.animals import router as animals_router
from .routes.event_types import router as event_types_router
from .routes.events import router as events_router
from .routes.groups import router as groups_router
from .routes.roles import router as roles_router
from .routes.upload import router as upload_router
from .routes.users import router as users_router
from .routes.zoo import router as zoo_router

api_router = APIRouter()

api_router.include_router(users_router)
api_router.include_router(zoo_router)
api_router.include_router(animals_router)
api_router.include_router(events_router)
api_router.include_router(event_types_router)
api_router.include_router(groups_router)
api_router.include_router(roles_router)
api_router.include_router(upload_router)
api_router.include_router(admin_router)
