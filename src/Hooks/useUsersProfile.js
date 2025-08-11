import { useState, useEffect } from "react";
import { ndkInstance } from "@/Helpers/NDKInstance";
import { NDKUser } from "@nostr-dev-kit/ndk";
import { useSelector } from "react-redux";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { getUser } from "@/Helpers/Controlers";

const useUserProfile = (pubkey) => {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [userProfile, setUserProfile] = useState(getEmptyuserMetadata(pubkey));
  const [isNip05Verified, setIsNip05Verified] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        let auth = getUser(pubkey);
        if (auth) {
          setUserProfile(auth);
          let ndkUser = new NDKUser({ pubkey });
          ndkUser.ndk = ndkInstance;
          let checknip05 =
            auth.nip05 && typeof auth.nip05 === "string"
              ? await ndkUser.validateNip05(auth.nip05)
              : false;

          if (checknip05) setIsNip05Verified(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (nostrAuthors.length > 0 && !isNip05Verified) fetchData();
  }, [nostrAuthors]);
  return { isNip05Verified, userProfile };
};

export default useUserProfile;
