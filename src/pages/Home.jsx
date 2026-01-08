import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { CustomButton, EditProfile, FriendsCard, InputText, Loading, NavBar, PostCard, ProfileCard, UserDirectory } from '../components';
import { Link } from 'react-router-dom';
import { NoProfile } from '../assets';
import { BsFiletypeGif, BsPersonFillAdd } from 'react-icons/bs';
import { BiImages, BiSolidVideo, BiSolidVideos } from 'react-icons/bi';
import { useForm } from 'react-hook-form';
import { apiRequest, deletePost, fetchPosts, getUserInfo, handleFileUpload, likePost, sendFriendRequest } from '../utils';
import { UserLogin } from '../redux/userSlice';


const Home = () => {
  const { posts } = useSelector(state => state.posts);
  const { user, edit } = useSelector((state) => state.user);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();

  const { register, handleSubmit, reset, formState: { errors }, } = useForm();

  const handlePostSubmit = async (data) => {
    setPosting(true)
    setErrMsg("");

    try {
      const uri = file && (await handleFileUpload(file));
      const newData = uri ? { ...data, image: uri } : data;

      const res = await apiRequest({
        url: "/posts/create-post",
        method: 'POST',
        token: user?.token,
        data: newData,
      });

      if (res?.status === "failed") {
        setErrMsg(res);

      } else {
        reset({
          description: "",
        });
        setFile(null);
        setErrMsg("");
        await fetchPost();
      }
      setPosting(false);
    } catch (error) {
      console.log(error);
      setPosting(false);
    }
  }

  const fetchPost = async () => {
    await fetchPosts(user?.token, dispatch);

    setLoading(false);
  }
  const handleLikePost = async (uri) => {
    await likePost({ uri: uri, token: user?.token });;
    await fetchPost();

  }
  const handleDelete = async (id) => {
    await deletePost(id, user.token);
    await fetchPost()

  }
  const fetchFriendRequests = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST",
      });
      setFriendRequest(res?.data);
    } catch (error) {
      console.log(error)
    }

  }
  const fetchSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });
      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error)
    }

  }
  const handleFriendRequest = async (id) => {
    try {
      const res = await sendFriendRequest(user.token, id);
      await fetchSuggestedFriends();
    } catch (error) {
      console.log(error)

    }

  }
  const acceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token: user?.token,
        method: "POST",
        data: { rid: id, status },
      });
      setFriendRequest(res?.data);
    } catch (error) {

    }

  }
  const getUser = async () => {
    const res = await getUserInfo(user?.token);
    const newData = { token: user?.token, ...res };
    dispatch(UserLogin(newData));
  }

  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequests();
    fetchSuggestedFriends();
  }, []);


  return (
    <>
      <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <NavBar />

        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
          {/* left */}
          <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>

            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>
          {/* center */}
          <div className='flex-1 h-full  px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
            <form className='bg-primary px-4 rounded-lg '
              onSubmit={handleSubmit(handlePostSubmit)}>
              <div className='w-full flex items-center gap-2 py-4 border-b border-[#66666645]'>
                <img src={user?.profileUrl ?? NoProfile}
                  alt="User Image"
                  className='w-14 h-14 rounded-full object-cover'
                />
                <InputText styles="w-full rounded-full py-5 "
                  placeholder="Share Your Thoughts..."
                  name="description"
                  register={register("description", {
                    required: "Write something about post",
                  })}
                  error={errors.description ? errors.description.message : ""}
                />
              </div>
              {
                // Check if 'errMsg' has a 'message' property and if it exists, render the following:
                errMsg?.message && (
                  // Render a <span> element with conditional classes based on 'errMsg?.status'
                  <span role='alert' className={`text-sm ${errMsg?.status === "failed" ? "text-[#f64949fe]" : "text-[#2ba150fe]"} mt-0.5`}>
                    {/* Display the 'errMsg' message */}
                    {errMsg?.message}
                  </span>
                )
              }
              <div className='flex items-center justify-between py-4'>
                <label htmlFor='imgUpload' className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className='hidden'
                    id='imgUpload'
                    data-max-size='5120'
                    accept='.jpg, .png, .jpeg'
                  />
                  <BiImages />
                  <span>Image</span>
                </label>
                <label htmlFor='vidUpload' className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className='hidden'
                    id='vidUpload'
                    data-max-size='5120'
                    accept='.mp4, .wav'
                  />
                  <BiSolidVideos />
                  <span>Video</span>
                </label>
                <label htmlFor='gifUpload' className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer'>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className='hidden'
                    id='gifUpload'
                    data-max-size='5120'
                    accept='.gif'
                  />
                  <BsFiletypeGif />
                  <span>Gif</span>
                </label>
                {posting ? (<Loading />) : (<CustomButton
                  type="submit"
                  title="Post"
                  containerStyles="bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm" />)}
              </div>
            </form>

            {
              loading ? (<Loading />) : posts?.length > 0 ? (
                posts?.map((post) => (
                  <PostCard key={post?._id}
                    post={post}
                    user={user}
                    deletePost={handleDelete}
                    likePost={handleLikePost} />
                ))
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <p className="text-lg text-ascent-2">No Post Available</p>
                </div>
              )}



          </div>

          {/*         right  */}
          <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
            {/* friend request */}
            <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5 '>
              <div className='flex items-center justify-between text-xl gap-2 text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span>Friend Request </span>
                <span className='text-[#f64949fe]'> {friendRequest?.length}</span>
              </div>

              <div className='w-full flex flex-col gap-4 pt-4 '>
                {friendRequest?.map(({ _id, requestFrom: from }) => {
                  return (
                    <div key={_id} className='flex items-center justify-between'>
                      <Link to={"/profile/" + from._id} className='w-full flex gap-4 items-center cursor-pointer'>
                        <img src={from?.profileUrl ?? NoProfile}
                          alt={from?.firstName}
                          className='w-10 h-10 object-cover rounded-full' />
                        <div className='flex-1'>
                          <p className='text-base font-medium text-ascent-1'>
                            {from?.firstName} {from?.lastName}
                          </p>
                          <span className='text-sm text-ascent-2'>
                            {from?.profession ?? "No Profession"}
                          </span>
                        </div>
                      </Link>
                      <div className='pl-2 flex gap-1'>
                        <CustomButton
                          title="Accept"
                          onClick={() => acceptFriendRequest(_id, "Accepted")}
                          containerStyles='bg-[#0444a4] text-xs text-white px-2.5 py-1.5 rounded-full' />
                        <CustomButton
                          title="Reject"
                          onClick={() => acceptFriendRequest(_id, "Rejected")}
                          containerStyles='border border-[#666] text-xs text-ascent-1 px-2.5 py-1.5 rounded-full' />

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* suggested */}

            <div className='bg-primary w-full shadow-sm rounded-lg px-5 py-5'>
              <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                <span>Suggested Friends</span>
              </div>
              <div className='w-full flex flex-col gap-4 pt-4'>
                {
                  suggestedFriends?.map((friend) => (
                    <div className='flex items-center justify-between '
                      key={friend?._id}>
                      <Link to={"/profile/" + friend?.id}
                        key={friend?._id}
                        className="w-full flex gap-4 items-center cursor-pointer">

                        <img src={friend?.profileUrl ?? NoProfile} alt={friend?.firstName}
                          className='w-10 h-10 object-cover rounded-full' />
                        <div className='flex-1'>
                          <p className='text-base font-medium text-ascent-1'>
                            {friend?.firstName}  {friend?.lastName}
                          </p>
                          <span className='text-sm text-ascent-2'>
                            {friend?.profession ?? "No Profession"}
                          </span>
                        </div>
                      </Link>
                      <div className='pl-4 flex gap-1'>
                        <button
                          className='bg-[#0444a430] text-sm text-white p-1 rounded'
                          onClick={() => handleFriendRequest(friend?._id)}>
                          <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                        </button>
                      </div>

                    </div>
                  ))
                }
              </div>
            </div>

            <UserDirectory token={user?.token} currentUserId={user?._id} />
          </div>
        </div>

      </div>

      {edit && <EditProfile />}
    </>
  )
}

export default Home
