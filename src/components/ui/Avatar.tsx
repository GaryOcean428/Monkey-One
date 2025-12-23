import React from 'react'

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  className = '',
  fallback,
  ...props
}) => {
  const [error, setError] = React.useState(false)

  const getFallback = () => {
    if (fallback) return fallback
    if (!alt || alt === '') return '?'
    return alt.charAt(0).toUpperCase()
  }

  return error || !src ? (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300 ${className} `}
      {...props}
    >
      {getFallback()}
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      onError={() => setError(true)}
      {...props}
    />
  )
}
