import axios from "axios";
import { SetPosts } from "../redux/postSlice";

const apiKey = import.meta.env.VITE_CLOUDINARY_ID;
const API_URL = "http://localhost:5000";

export const API = axios.create({
    baseURL: API_URL,
    responseType: "json",
});

export const apiRequest = async ({ url, token, data, method }) => {
    try {
        const result = await API({
            url,
            method: method || "GET",
            data,
            headers: {
                "content-type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
        return result?.data;
    } catch (error) {
        const err = error.response?.data;
        console.log(err);
        return { status: err?.success, message: err?.message };
    }
};

export const listAllUsers = async ({ token, search }) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest({
        url: `/users${query}`,
        token,
        method: "GET",
    });
};

export const createNewUser = async ({ token, data }) => {
    return apiRequest({
        url: "/users",
        token,
        method: "POST",
        data,
    });
};

export const deleteUserById = async ({ token, id }) => {
    return apiRequest({
        url: `/users/${id}`,
        token,
        method: "DELETE",
    });
};

export const updatePostComment = async ({ token, id, comment }) => {
    return apiRequest({
        url: `/posts/comments/${id}`,
        token,
        method: "PUT",
        data: { comment },
    });
};

export const deletePostComment = async ({ token, id }) => {
    return apiRequest({
        url: `/posts/comments/${id}`,
        token,
        method: "DELETE",
    });
};

export const handleFileUpload = async (uploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("upload_preset", "connectify");

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${apiKey}/image/upload/`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.log(error);
    }
};

export const fetchPosts = async (token, dispatch, uri, data) => {
    try {
        const res = await apiRequest({
            url: uri || "/posts",
            token,
            method: "POST",
            data: data || {},
        });
        dispatch(SetPosts(res?.data));
    } catch (error) {
        console.log(error);
    }
};

export const likePost = async ({ uri, token }) => {
    try {
        return await apiRequest({
            url: uri,
            token,
            method: "POST",
        });
    } catch (error) {
        console.log(error);
    }
};

export const deletePost = async (id, token) => {
    try {
        await apiRequest({
            url: `/posts/${id}`,
            token,
            method: "DELETE",
        });
    } catch (error) {
        console.log(error);
    }
};

export const getUserInfo = async (token, id) => {
    try {
        const uri = id === undefined ? "/users/get-user" : `/users/get-user/${id}`;
        const res = await apiRequest({
            url: uri,
            token,
            method: "POST",
        });

        if (res?.message === "Authentication failed") {
            localStorage.removeItem("user");
            window.alert("User session expired. Login again.");
            window.location.replace("/login");
            return null;
        }

        return res?.user;
    } catch (error) {
        console.error(error);
    }
};

export const sendFriendRequest = async (token, id) => {
    try {
        await apiRequest({
            url: "/users/friend-request",
            token,
            method: "POST",
            data: { requestTo: id },
        });
    } catch (error) {
        console.log(error);
    }
};

export const viewUserProfile = async (token, id) => {
    try {
        await apiRequest({
            url: "/users/profile-view",
            token,
            method: "POST",
            data: { id },
        });
    } catch (error) {
        console.log(error);
    }
};