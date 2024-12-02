import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href']
  },
  allowedIframeHostnames: []
};

export function SanitizeHtml(options?: sanitizeHtml.IOptions) {
  return Transform(({ value }) => {
    if (!value) return value;
    return sanitizeHtml(value, options || defaultOptions);
  });
}
