import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputText from "./InputText";
import CustomButton from "./CustomButton";
import Loading from "./Loading";
import {
    listAllUsers,
    createNewUser,
    deleteUserById,
} from "../utils";

const UserDirectory = ({ token, currentUserId }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm();

    const fetchUsers = async (query = "") => {
        try {
            setLoading(true);
            const res = await listAllUsers({ token, search: query });
            const data = res?.data ?? res;
            setUsers(data ?? []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const onSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    const onCreateUser = async (data) => {
        setErrorMessage("");
        try {
            const res = await createNewUser({ token, data });
            if (res?.success) {
                reset();
                fetchUsers();
            } else {
                setErrorMessage(res?.message ?? "Unable to create user");
            }
        } catch (error) {
            console.log(error);
            setErrorMessage("Something went wrong");
        }
    };

    const handleDelete = async (userId) => {
        if (currentUserId === userId) {
            setErrorMessage("Vous ne pouvez pas supprimer votre propre compte.");
            return;
        }
        try {
            await deleteUserById({ token, id: userId });
            fetchUsers();
        } catch (error) {
            console.log(error);
            setErrorMessage("Suppression impossible");
        }
    };

    return (
        <div className='bg-primary w-full shadow-sm rounded-lg px-5 py-5 flex flex-col gap-4'>
            <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645] pb-2'>
                <span>Gestion Utilisateurs</span>
                <span className='text-ascent-2 text-sm'>{users?.length ?? 0} comptes</span>
            </div>

            <form className='flex gap-2' onSubmit={onSearch}>
                <InputText
                    styles='flex-1 rounded-full py-2'
                    placeholder='Rechercher (Nom, Email)'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <CustomButton
                    type='submit'
                    title='Chercher'
                    containerStyles='bg-[#0444a4] text-white px-4 py-2 rounded-full'
                />
            </form>

            <div className='border-t border-[#66666645] pt-4'>
                <p className='text-ascent-1 font-semibold mb-2'>Créer un utilisateur</p>
                {errorMessage && (
                    <span className='text-sm text-[#f64949fe]'>{errorMessage}</span>
                )}
                <form className='grid grid-cols-1 gap-3' onSubmit={handleSubmit(onCreateUser)}>
                    <InputText
                        placeholder='Prénom'
                        styles='rounded-full py-2'
                        register={register("firstName", { required: "Prénom requis" })}
                        error={errors.firstName?.message}
                    />
                    <InputText
                        placeholder='Nom'
                        styles='rounded-full py-2'
                        register={register("lastName", { required: "Nom requis" })}
                        error={errors.lastName?.message}
                    />
                    <InputText
                        placeholder='Email'
                        styles='rounded-full py-2'
                        register={register("email", {
                            required: "Email requis",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email invalide",
                            },
                        })}
                        error={errors.email?.message}
                    />
                    <InputText
                        placeholder='Mot de passe'
                        type='password'
                        styles='rounded-full py-2'
                        register={register("password", {
                            required: "Mot de passe requis",
                            minLength: { value: 6, message: "6 caractères minimum" },
                        })}
                        error={errors.password?.message}
                    />
                    <InputText
                        placeholder='Profession'
                        styles='rounded-full py-2'
                        register={register("profession")}
                    />
                    <InputText
                        placeholder='Localisation'
                        styles='rounded-full py-2'
                        register={register("location")}
                    />
                    <CustomButton
                        type='submit'
                        title={isSubmitting ? "Création..." : "Ajouter"}
                        containerStyles='bg-[#0444a4] text-white py-2 rounded-full disabled:opacity-60'
                        disabled={isSubmitting}
                    />
                </form>
            </div>

            <div className='border-t border-[#66666645] pt-4'>
                <p className='text-ascent-1 font-semibold mb-3'>Utilisateurs</p>
                {loading ? (
                    <Loading />
                ) : (
                    <div className='flex flex-col gap-3 max-h-80 overflow-y-auto'>
                        {users?.map((usr) => (
                            <div
                                key={usr?._id}
                                className='flex items-center justify-between border border-[#66666625] rounded-lg px-3 py-2'
                            >
                                <div>
                                    <p className='text-ascent-1 font-semibold text-sm'>
                                        {usr?.firstName} {usr?.lastName}
                                    </p>
                                    <p className='text-xs text-ascent-2'>{usr?.email}</p>
                                    <p className='text-xs text-ascent-2'>
                                        {usr?.profession ?? "Sans profession"}
                                    </p>
                                </div>
                                {usr?._id !== currentUserId && (
                                    <button
                                        className='text-[#f64949fe] text-xs border border-[#f64949fe] px-2 py-1 rounded-full'
                                        onClick={() => handleDelete(usr?._id)}
                                    >
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        ))}
                        {users?.length === 0 && (
                            <p className='text-sm text-ascent-2 text-center'>
                                Aucun utilisateur trouvé.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDirectory;
