import React from 'react'

const InputText = React.forwardRef(({
    type = "text",
    placeholder,
    styles = "",
    label,
    labelStyles = "",
    labelStyle = "",
    register,
    name,
    error,
    ...rest
}, ref) => {
    const registerProps = register || {};
    const mergedLabelStyles = [labelStyles, labelStyle].filter(Boolean).join(" ");
    return (
        <div className='w-full flex flex-col mt-2'>
            {label && (<p className={`text-ascent-2 text-sm mb-2 ${mergedLabelStyles}`}>{label}</p>)}
            <div>
                <input
                    ref={ref}
                    placeholder={placeholder}
                    name={name}
                    type={type}
                    className={`bg-secondary rounded border border-[#66666690] outline-none text-sm text-ascent-1 px-4 py-3 placeholder:text-[#666] ${styles}`}
                    {...registerProps}
                    {...rest}
                    aria-invalid={error ? "true" : "false"}
                />
            </div>
            {error && (
                <span className='text-xs text-[#f64949fe] mt-0.5'>{error}</span>
            )}

        </div>
    )
});

export default InputText
