import os

base_dir = r'C:\Users\gmh08\OneDrive\Pictures\Desktop\SIH26\LAND2BIZ'
api_app_dir = os.path.join(base_dir, 'apps', 'api', 'app')
core_dir = os.path.join(api_app_dir, 'core')
os.makedirs(core_dir, exist_ok=True)

with open(os.path.join(core_dir, 'exceptions.py'), 'w') as f:
    f.write("""from fastapi import Request, JSONResponse
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
""")

main_py = os.path.join(api_app_dir, 'main.py')
with open(main_py, 'r') as f:
    main_content = f.read()

if 'Land2BizException' not in main_content:
    main_content = main_content.replace('app = FastAPI(title="LAND2BIZ API", version="0.2.0")', 
    'app = FastAPI(title="LAND2BIZ API", version="0.2.0")\n\nfrom .core.exceptions import Land2BizException, land2biz_exception_handler\napp.add_exception_handler(Land2BizException, land2biz_exception_handler)')
    
    with open(main_py, 'w') as f:
        f.write(main_content)

db_dir = os.path.join(api_app_dir, 'db')
os.makedirs(db_dir, exist_ok=True)
with open(os.path.join(db_dir, 'session.py'), 'w') as f:
    f.write("""from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/land2biz')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""")

web_lib_dir = os.path.join(base_dir, 'apps', 'web', 'lib')
os.makedirs(web_lib_dir, exist_ok=True)
with open(os.path.join(web_lib_dir, 'apiClient.ts'), 'w') as f:
    f.write("""export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    if (data.error) {
      throw new Error(`[${data.error.module}] ${data.error.message} (Ref: ${data.error.request_id})`);
    }
    throw new Error('API request failed');
  }
  return data;
};
""")

# Setup Vitest for Frontend testing
web_dir = os.path.join(base_dir, 'apps', 'web')
with open(os.path.join(web_dir, 'vitest.config.ts'), 'w') as f:
    f.write("""import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
""")

with open(os.path.join(web_dir, 'package.json'), 'r') as f:
    pkg = f.read()
if 'vitest' not in pkg:
    pkg = pkg.replace('"scripts": {', '"scripts": {\n    "test": "vitest run",')
    with open(os.path.join(web_dir, 'package.json'), 'w') as f:
        f.write(pkg)

print("Lock script finished.")
