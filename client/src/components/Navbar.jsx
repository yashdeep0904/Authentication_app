import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/main_logo.png'
import Theme from './Theme'
 
const Navbar = () => {

  const [showDropdown,setShowDropdown] = useState(false)

  return (
    <nav className='flex justify-between items-center h-20 w-screen border-0.5 shadow-xl/20 text-black fixed top-0 z-50 bg-white' >
        <Link to={'/'} > <img className='h-20 w-30 ml-20 '
        src={logo} /></Link>

        <div className='text-xl flex gap-5 '>
            <Link to={'/'} className='hover:border-b hover:text-gray-700 '> Home </Link>
            <Link className='hover:border-b hover:text-gray-700 '> Services </Link>
            <Link className='hover:border-b hover:text-gray-700 '> Contact </Link>
            <Link className='hover:border-b hover:text-gray-700 '> About Us </Link>
        </div>

        <div className='flex gap-10 mr-20 justify-center items-center'>
            {/* Dropdown Container */}
            <div className='relative'>
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className='h-10 w-32 text-xl bg-fuchsia-50 border-0.5 shadow-xl/10 rounded-xl cursor-pointer hover:bg-fuchsia-100 transition-all'>Sign In </button>
                            
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className='absolute top-12 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50'>
                    <Link to='/admin/login' 
                      className='block px-4 py-2 hover:bg-fuchsia-50 text-gray-800'
                      onClick={() => setShowDropdown(false)}>Admin Portal
                    </Link>
                    
                      
                    <Link to='/registration' className='block px-4 py-2 hover:bg-fuchsia-50 text-gray-800'
                      onClick={() => setShowDropdown(false)}> Student Portal
                    </Link>                                    
                  </div>
                )}
            </div>

            <div>
                <Theme/>
            </div>
        </div>

        

    </nav>
  )
}

export default Navbar