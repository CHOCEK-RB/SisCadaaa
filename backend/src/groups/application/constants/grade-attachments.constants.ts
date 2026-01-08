import { join } from 'path';

import { UPLOADS_ROOT } from 'src/shared/uploads-path';

export const GRADE_ATTACHMENT_UPLOAD_DIR = join(UPLOADS_ROOT, 'grades');

export const GRADE_ATTACHMENT_PUBLIC_PATH = '/uploads/grades';

export const GRADE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;