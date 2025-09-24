import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getEmptyuserMetadata } from "@/Helpers/Encryptions";
import { getUser } from "@/Helpers/Controlers";
import { getAuthPubkeyFromNip05 } from "@/Helpers/Helpers";

const useUserProfile = (pubkey, verifyNip05 = true) => {
  const nostrAuthors = useSelector((state) => state.nostrAuthors);
  const [userProfile, setUserProfile] = useState(getEmptyuserMetadata(pubkey));
  const [isNip05Verified, setIsNip05Verified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let auth = getUser(pubkey);
        if (auth) {
          setUserProfile(auth);
          if (verifyNip05) {
            let isChecked =
              auth.nip05 && typeof auth.nip05 === "string"
                ? await getAuthPubkeyFromNip05(auth.nip05)
                : false;
            if (isChecked) setIsNip05Verified(true);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (nostrAuthors.length > 0 && !isNip05Verified) fetchData();
  }, [nostrAuthors, verifyNip05]);
  return { isNip05Verified, userProfile };
};

export default useUserProfile;
