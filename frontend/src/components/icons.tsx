import { cn } from "@/utils";

export interface SvgProps extends React.SVGProps<SVGSVGElement> {}

export function Google(props: SvgProps) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      />
    </svg>
  );
}

export function GitHub(props: SvgProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
      />
    </svg>
  );
}

export function Spinner(props: SvgProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("", props.className)}
      fill="currentColor"
    >
      <g className="spinner_OSmW">
        <rect x="11" y="1" width="2" height="5" opacity=".14" />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(30 12 12)"
          opacity=".29"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(60 12 12)"
          opacity=".43"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(90 12 12)"
          opacity=".57"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(120 12 12)"
          opacity=".71"
        />
        <rect
          x="11"
          y="1"
          width="2"
          height="5"
          transform="rotate(150 12 12)"
          opacity=".86"
        />
        <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)" />
      </g>
    </svg>
  );
}

export function LoadingDots(props: SvgProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="spinner_b2T7" cx="4" cy="12" r="3" />
      <circle className="spinner_b2T7 spinner_YRVV" cx="12" cy="12" r="3" />
      <circle className="spinner_b2T7 spinner_c9oY" cx="20" cy="12" r="3" />
    </svg>
  );
}

export function Comment(props: SvgProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none">
        <path
          fill="currentColor"
          d="m4.327 6.638l.891.454zm.441 13.594l-.707-.707zm13.594-3.559l.454.891zm1.311-1.311l.891.454zm0-8.724l.891-.454zm-1.311-1.311l.454-.891zm-12.724 0l.454.891zm2.07 11.966L7 16.586zM5 9.8c0-.857 0-1.439.038-1.889c.035-.438.1-.663.18-.819l-1.782-.908c-.247.485-.346 1.002-.392 1.564C3 8.298 3 8.976 3 9.8zM5 12V9.8H3V12zm-2 0v5h2v-5zm0 5v2.914h2V17zm0 2.914c0 1.291 1.562 1.938 2.475 1.025l-1.414-1.414a.55.55 0 0 1 .939.389zm2.475 1.025L8.415 18L7 16.586l-2.939 2.939zM15.2 16H8.414v2H15.2zm2.708-.218c-.156.08-.38.145-.819.18c-.45.037-1.032.038-1.889.038v2c.824 0 1.501 0 2.052-.044c.562-.046 1.079-.145 1.564-.392zm.874-.874a2 2 0 0 1-.874.874l.908 1.782a4 4 0 0 0 1.748-1.748zM19 12.2c0 .857 0 1.439-.038 1.889c-.035.438-.1.663-.18.819l1.782.908c.247-.485.346-1.002.392-1.564c.045-.55.044-1.228.044-2.052zm0-2.4v2.4h2V9.8zm-.218-2.708c.08.156.145.38.18.819C19 8.361 19 8.943 19 9.8h2c0-.824 0-1.501-.044-2.052c-.046-.562-.145-1.079-.392-1.564zm-.874-.874a2 2 0 0 1 .874.874l1.782-.908a4 4 0 0 0-1.748-1.748zM15.2 6c.857 0 1.439 0 1.889.038c.438.035.663.1.819.18l.908-1.782c-.485-.247-1.002-.346-1.564-.392C16.702 4 16.024 4 15.2 4zM8.8 6h6.4V4H8.8zm-2.708.218c.156-.08.38-.145.819-.18C7.361 6 7.943 6 8.8 6V4c-.824 0-1.501 0-2.052.044c-.562.046-1.079.145-1.564.392zm-.874.874a2 2 0 0 1 .874-.874l-.908-1.782a4 4 0 0 0-1.748 1.748zM8.414 18v-2A2 2 0 0 0 7 16.586z"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 9h8m-8 4h5"
        />
      </g>
    </svg>
  );
}
