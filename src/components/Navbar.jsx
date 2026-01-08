import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TbSocial } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { CustomButton, InputText } from '.'
import { useForm } from 'react-hook-form'
import { BsMoon, BsSunFill } from 'react-icons/bs'
import { IoMdNotificationsOutline } from 'react-icons/io'
import { SetTheme } from '../redux/themeSlice'
import { UserLogout } from '../redux/userSlice'
import { fetchPosts } from '../utils'


const NavBar = () => {
    const { theme } = useSelector((state) => state.theme);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm()

    const handleSearch = async (data) => {
        await fetchPosts(user.token, dispatch, "",data);

    }

    const handleTheme = () => {
        const themeValue = theme === "light" ? "dark" : "light";

        dispatch(SetTheme(themeValue))
        // console.log("theme buttoj")
    }
    return (
        <div className='navbar w-full flex itmes-center justify-between py-3 md:py-6 px-4 bg-primary'>
            <Link to="/" className='flex gap-2 items-center'>
                <div className='p-1 md:p-2 bg-blue rounded text-white'>
                    <TbSocial />
                </div>
                <span className='text-xl md:text-2xl text-blue font-semibold'>
                    Connecty
                </span>

            </Link>

            <form
                className='hidden md:flex items-center justify-center'
                onSubmit={handleSubmit(handleSearch)}>

                <InputText
                    placeholder='Search...'
                    styles="w-[18rem] lg:w-[38rem] rounded-l-full py-3"
                    register={register("search")}
                />
                <CustomButton
                    title="Search"
                    type='submit'
                    containerStyles="bg-[#0444a4] text-white px-6 py-2.5 mt-2 rounded-r-full"
                />

            </form>

            {/* icons */}

            <div className='flex gap-4 items-center text-ascent-1 text-md md:text-xl'>
                <button onClick={() => handleTheme()}>
                    {theme ? <BsMoon /> : <BsSunFill></BsSunFill>}
                </button>
                <div className='hidden lg:flex'>
                    <IoMdNotificationsOutline />
                </div>
                <div>
                    <CustomButton
                    onClick={()=>dispatch(UserLogout())}
                    title = "Log Out"
                    containerStyles = "text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full"
                     />
                </div>
            </div>

        </div>
    )
}

export default NavBar
