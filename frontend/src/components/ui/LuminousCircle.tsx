'use client'

interface LuminousCircleProps {
  top?: string
  right?: string | null
  left?: string | null
  bottom?: string | null
  width?: string
  height?: string
  zIndex?: number
  opacity?: number
}

export default function LuminousCircle({
  top = '50%',
  right = null,
  left = null,
  bottom = null,
  width = '400px',
  height = '400px',
  zIndex = 1,
  opacity = 1,
}: LuminousCircleProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: zIndex,
    pointerEvents: 'none',
    opacity: opacity,
  }

  if (bottom !== null) {
    style.bottom = bottom
    if (left === '50%') {
      style.transform = 'translateX(-50%) translateY(50%)'
    } else {
      style.transform = 'translateY(50%)'
    }
  } else {
    style.top = top
    if (left === '50%') {
      style.transform = 'translateX(-50%) translateY(-50%)'
    } else {
      style.transform = 'translateY(-50%)'
    }
  }

  if (right !== null) {
    style.right = right
  }
  if (left !== null && left !== '50%') {
    style.left = left
  } else if (left === '50%') {
    style.left = left
  }

  // Gradient avec #D9D9D9 (rgb(217, 217, 217)) - Effet de lumière sortant du bord
  const backgroundStyle = {
    background: 'radial-gradient(circle, rgba(217, 217, 217, 0.5) 0%, rgba(217, 217, 217, 0.35) 15%, rgba(217, 217, 217, 0.2) 30%, rgba(217, 217, 217, 0.1) 50%, rgba(217, 217, 217, 0.05) 70%, transparent 100%)',
    borderRadius: '50%',
    filter: 'blur(35px)',
  }

  return (
    <div
      className="luminous-circle"
      style={{ ...style, ...backgroundStyle }}
    />
  )
}

