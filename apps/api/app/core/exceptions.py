from fastapi import Request
from fastapi.responses import JSONResponse
import uuid
from datetime import datetime

class Land2BizException(Exception):
    def __init__(self, message: str, module: str, layer: str, error_type: str = 'INTERNAL_ERROR'):
        self.message = message
        self.module = module
        self.layer = layer
        self.error_type = error_type
        self.request_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow().isoformat()
        super().__init__(self.message)

async def land2biz_exception_handler(request: Request, exc: Land2BizException):
    return JSONResponse(
        status_code=400,
        content={
            'error': {
                'message': exc.message,
                'module': exc.module,
                'layer': exc.layer,
                'error_type': exc.error_type,
                'request_id': exc.request_id,
                'timestamp': exc.timestamp
            }
        }
    )
