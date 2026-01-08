import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { MdClose } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import InputText from './InputText';
import CustomButton from './CustomButton';
import Loading from './Loading';
import { UserLogin, updateProfile } from '../redux/userSlice';
import { apiRequest, handleFileUpload } from '../utils';

const EditProfile = () => {

    const { user } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const [errMsg, setErrMsg] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [picture, setPicture] = useState(null);
    const { register, handleSubmit, formState: { errors }, } = useForm({
        mode: "onChange",
        defaultValues: { ...user },
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setErrMsg("");
        try {
            const uri= picture && (await handleFileUpload(picture));

            const { firstName, lastName, location, profession} = data;

            const res = await apiRequest({
                url: "/users/update-user",
                data:{
                    firstName,
                    lastName,
                    location,
                    profession,
                    profileUrl: uri ? uri : user?.profileUrl,
                },
                method: "PUT",
                token: user?.token,
            });
            if (res?.status === "failed") {
                setErrMsg(res);
            } else {
                setErrMsg(res);
                const newUser = { token: res?.token, ...res?.user };
                dispatch(UserLogin(newUser));

                setTimeout(() => {
                    dispatch(updateProfile(false));
                }, 3000);
            }

            setIsSubmitting(false);
            
        } catch (error) {
            console.log(error);
            setIsSubmitting(false);
        }
     }
    const handleClose =  () => {
        dispatch(updateProfile(false))
     }
    const handleSelect = (e) => {
        setPicture(e.target.files[0])
     }

    return (
        <>
            <div className='fixed z-50 inset-0 overflow-y-auto' >
                <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
                    <div className='fixed inset-0 transition-opacity' >

                        <div className=' absolute inset-0 bg-[#000] opacity-70'></div>
                    </div>
                    <span className='hidden sm:inline-block sm:align-middle sm:h-screen ' ></span>
                    &#8203

                    <div
                        className=' inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
                        role='dialog'
                        aria-modal=' true '
                        aria-labelledby=' modal-headline '>

                        <div className='flex justify-between px-6 pt-5 pb-2'>
                            < label
                                htmlFor=' name '
                                className=' block font-medium text-xl text-ascent-1 text-left '>Edit Profile</label>

                            <button className='text-ascent-1' onClick={handleClose}>
                                <MdClose size={22} />
                            </button>
                        </div>

                        <form className='px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6' onSubmit={handleSubmit(onSubmit)}>

                            <InputText
                                name="firstName"
                                label="First Name"
                                type="text"
                                placeholder="First Name"
                                styles="w-full"
                                register={register("firstName", {
                                    required: "First name is required",
                                })}
                                error={errors.firstName ? errors.firstName?.message : ""}


                            />
                            <InputText
                                name="lastName"
                                label="Last Name"
                                type="text"
                                placeholder="Last Name"
                                styles="w-full"
                                register={register("lastName", {
                                    required: "Last name is required",
                                })}
                                error={errors.lastName ? errors.lastName?.message : ""}


                            />
                            <InputText
                                name="profession"
                                label="Profession"
                                type="text"
                                placeholder="Profession"
                                styles="w-full"
                                register={register("profession", {
                                    required: "Profession is required",
                                })}
                                error={errors.profession ? errors.profession?.message : ""}


                            />
                            <InputText
                                name="location"
                                label="Location"
                                type="text"
                                placeholder="Location"
                                styles="w-full"
                                register={register("location", {
                                    required: "Location is required",
                                })}
                                error={errors.location ? errors.location?.message : ""}


                            />
                            <label className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4' htmlFor='imgUpload'>
                                <input
                                    type='file'
                                    className=''
                                    id='imgUpload'
                                    onChange={(e) => handleSelect(e)}
                                    accept='.jpg, .png, .jpeg'
                                />
                            </label>
                            {
                                // Check if 'errMsg' has a 'message' property and if it exists, render the following:
                                errMsg?.message && (
                                    // Render a <span> element with conditional classes based on 'err.Msg?.status'
                                    <span role='alert' className={`text-sm ${errMsg?.status === "failed" ? "text-[#f64949fe]" : "text-[#2ba150fe]"} mt-0.5`}>
                                        {/* Display the 'errMsg' message */}
                                        {errMsg?.message}
                                    </span>
                                )
                            }
                            <div className='py-5 sm:flex sm:flex-row-reverse border-t border-[#66666645]'>
                                {
                                    isSubmitting ?( <Loading /> ):( <CustomButton type='submit' containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`} title="Submit" />
                                )}
                            </div>

                        </form>


                    </div>


                </div>
                1
            </div>


        </>

    )
}


export default EditProfile
