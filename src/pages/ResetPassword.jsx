import React, { useState } from 'react'
import {useForm} from "react-hook-form"
import { CustomButton, InputText, Loading } from '../components';
import { apiRequest } from '../utils';

const ResetPassword = () => {

  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  })
  const onSubmit = async(data)=>{
    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/users/request-passwordreset",
        data:data,
        method: "POST",
      });
      if(res?.status === "failed"){
        setErrMsg(res);
      }
      else{
        setErrMsg(res);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.log(error)
      setIsSubmitting(false);
    }
  };
  return (
    <div className='w-full h-[100vh] bg-bgColor flex items-center justify-center p-6'>
      <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg'>
        <p className='text-ascent-1 text-lg font-semibold'>Email Address</p>
        <span className='text-sm text-ascent-2'>
        Your Registered Email Address, Please.
        </span>

        <form 
        className='py-4 flex flex-col gap-5'
        onSubmit={handleSubmit(onSubmit)}>
          <InputText
              name="email"
              // label="Email ID"
              placeholder="email@example.com"
              type="email"
              register={                  // Using the 'register' prop to connect this input to form validation.
                register("email", {       // Calling 'register' function with field name and validation rules.
                  required: "Email ID is required" // Specifying that the field is required and providing an error message.
                })
              }
              styles="w-full rounded-lg"
              // labelStyle='ml-2'
              error={errors.email ? errors.email.message : ""}
            />
            {
              // Check if 'errMsg' has a 'message' property and if it exists, render the following:
              errMsg?.message && (
                // Render a <span> element with conditional classes based on 'err.Msg?.status'
                <span className={`text-sm ${errMsg?.status === "failed" ? "text-[#f64949fe]" : "text-[#2ba150fe]"} mt-0.5`}>
                  {/* Display the 'errMsg' message */}
                  {errMsg?.message}
                </span>
              )
            }
            {
              isSubmitting? <Loading /> : <CustomButton type='submit' containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`} title = "Submit"/>      
                    }

        </form>
      </div>

    </div>
  )
}

export default ResetPassword
