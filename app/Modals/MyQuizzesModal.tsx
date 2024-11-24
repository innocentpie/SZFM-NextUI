// components/MyQuizzesModal.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { useAuth } from '../authentication/AuthContext';
import pb from '../authentication/PocketBaseClient';

interface Quiz {
  id: string;
  quiz_code: string;
  quiz_description: string;
  number_of_questions: number;
  category: string;
  difficulty: number;
  questions: string;
  answers: string;
  correct_answers: string;
  creator: string;
  created: string;
  updated: string;
}

interface MyQuizzesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyQuizzesModal: React.FC<MyQuizzesModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await pb.collection('quizzes').getFullList<Quiz>({
          filter: `creator="${user.id}"`,
          sort: '-created',
        });
        setQuizzes(response);
      } catch (error) {
        console.error('Quizzes fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchQuizzes();
    }
  }, [isOpen, user]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="opaque">
      <ModalContent>
        <ModalHeader>Saját Kvízek</ModalHeader>
        <ModalBody>
          {loading ? (
            <div>Betöltés...</div>
          ) : quizzes.length === 0 ? (
            <div>Nincsenek kvízek.</div>
          ) : (
            <div>
              {quizzes.map((quiz) => (
                <div key={quiz.id}>
                  <div>{quiz.quiz_code}</div>: {quiz.quiz_description}
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Bezárás
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MyQuizzesModal;
