import React from 'react'

type Props = {
  btnType: "button" | "submit" | "reset";
  title: string;
  handleClick?: () => void;
  styles?: string;
}

const CustomButton: React.FC<Props> = ({ btnType, title, handleClick, styles }) => {
  return (
    <button
      type={btnType}
      className={`font-epilogue font-semibold text-[16px] leading-[26px] text-white min-h-[52px] px-4 rounded-[10px] ${styles}`}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton
