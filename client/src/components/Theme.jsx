import React, { useContext } from 'react'
import { LuMoon } from "react-icons/lu";
import { LuSunMedium } from "react-icons/lu";
import { ThemeContext } from '../context/ThemeContext';

const Theme = () => {

  const { theme ,toggleTheme } = useContext(ThemeContext)

  return (

        <div className='h-15 w-15 flex justify-center items-center cursor-pointer' onClick={toggleTheme}>

            {theme ==='light' ? <LuMoon size={30}/> : <LuSunMedium className='text-black' size={30}/>}
            
        </div>
  )
}

export default Theme