'use client';

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useAuth } from "../authentication/AuthContext";
import Image from "next/image";
import avatarImages from '../assets/avatarImages';
import { Bounce, toast, ToastContainer } from "react-toastify";

const predefinedImageKeys = [
  "avatar1",
  "avatar2",
  "avatar3",
  "avatar4",
  "avatar5",
  "avatar6",
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [selectedImageKey, setSelectedImageKey] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setSelectedImageKey(user.profile_picture || "avatar1");
    }
  }, [user]);

  const handleImageSelect = (imageKey: string) => {
    setSelectedImageKey(imageKey);
  };

  const ErrorOptions = {
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
  }
  const SuccesOptions = {
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      await updateProfile({ username, profile_picture: selectedImageKey });
      
      
      toast.success("Sikeres szerkesztés",SuccesOptions)
      await new Promise(f => setTimeout(f, 1000));
      onClose();
    } catch (error) {
      console.error("Profil szerkesztési hiba:", error);
      //alert("Hiba történt a profil szerkesztésekor. Lehet, hogy létezik már azonos névvel felhasználó.");
      toast.error("Hiba történt a profil szerkesztésekor.\nLehet, hogy létezik már azonos névvel felhasználó.",ErrorOptions)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="opaque">
      <ToastContainer stacked limit={5}
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Profil Szerkesztése</ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={avatarImages[selectedImageKey] || "/assets/images/defaultAvatar.png"}
                  alt="Selected Profile Picture"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <div>Válassz egy profilképet:</div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {predefinedImageKeys.map((imageKey) => (
                    <div
                      key={imageKey}
                      className={`relative cursor-pointer border-2 ${selectedImageKey === imageKey ? "border-blue-500" : "border-transparent"
                        } rounded-full`}
                      onClick={() => handleImageSelect(imageKey)}
                    >
                      <Image
                        src={avatarImages[imageKey]}
                        alt={`Predefined Avatar ${imageKey}`}
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                      {selectedImageKey === imageKey && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-50 rounded-full">
                          <div color="white">✓</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Input
                label="Felhasználónév"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              disabled={isSubmitting}
            >
              Bezárás
            </Button>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? "Mentés..." : "Mentés"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditProfileModal;
