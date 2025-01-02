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
    if (!alt) return '?'
    return alt.charAt(0).toUpperCase()
  }

  return error || !src ? (
    <div
      className={`
        inline-flex items-center justify-center
        bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300
        rounded-full font-medium
        ${className}
      `}
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
