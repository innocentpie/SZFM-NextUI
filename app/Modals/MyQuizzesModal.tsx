'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Select, SelectItem, Divider } from "@nextui-org/react";
import { useAuth } from '../authentication/AuthContext';
import pb from '../authentication/PocketBaseClient';
import * as icons from '../assets/SvgIcons';

interface Quiz {
  id: string;
  quiz_code: string;
  quiz_description: string;
  number_of_questions: number;
  category: string;
  difficulty: string;
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
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [quizDescription, setQuizDescription] = useState('');
  const [category, setCategory] = useState<{ label: string; icon: JSX.Element } | null>(null);
  const [difficulty, setDifficulty] = useState<{ label: string; icon: JSX.Element } | null>(null);

  const categories = [
    { label: 'matematika', icon: <icons.MynauiMathSolid /> },
    { label: 'tudomány', icon: <icons.MdiFlask /> },
    { label: 'művészet', icon: <icons.MdiArt /> },
    { label: 'sport', icon: <icons.FluentSport16Regular /> },
    { label: 'technológia', icon: <icons.GridiconsPhone /> },
    { label: 'utazás', icon: <icons.FaPlane /> },
    { label: 'videók', icon: <icons.RiMovieLine /> },
    { label: 'film', icon: <icons.BxCameraMovie /> },
    { label: 'zene', icon: <icons.MdiMusic /> },
    { label: 'könyvek', icon: <icons.MaterialSymbolsBookOutline /> },
    { label: 'játékok', icon: <icons.IonGameControllerOutline /> },
    { label: 'egyéb', icon: <icons.BasilOther1Outline /> },
  ];

  const difficulties = [
    { label: 'Könnyű', icon: <icons.MynauiSquareSolid /> },
    { label: 'Közepes', icon: <icons.MynauiSquareSolid2 /> },
    { label: 'Nehéz', icon: <icons.MynauiSquareSolid3 /> },
  ];

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let response;
        if (user.role) {
          response = await pb.collection('quizzes').getFullList<Quiz>({
            sort: '-created',
          });
        }
        else {
          response = await pb.collection('quizzes').getFullList<Quiz>({
            filter: `creator="${user.id}"`,
            sort: '-created',
          });
        }
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

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizDescription(quiz.quiz_description);
    const matchedCategory = categories.find((cat) => cat.label === quiz.category);
    const matchedDifficulty = difficulties.find((diff) => diff.label === quiz.difficulty);
    setCategory(matchedCategory || null);
    setDifficulty(matchedDifficulty || null);
  };

  const handleEditSubmit = async () => {
    if (!editingQuiz || !category || !difficulty) {
      alert('Kérjük, töltsd ki az összes mezőt!');
      return;
    }

    const updatedQuiz = {
      ...editingQuiz,
      quiz_description: quizDescription,
      category: category.label,
      difficulty: difficulty.label,
    };

    try {
      await pb.collection('quizzes').update(editingQuiz.id, updatedQuiz);
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) => (quiz.id === editingQuiz.id ? updatedQuiz : quiz))
      );
      setEditingQuiz(null);
      alert('Kvíz sikeresen frissítve!');
    } catch (error) {
      console.error('Update quiz error:', error);
      alert('Hiba történt a kvíz frissítésekor.');
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      const leaderboard = await pb.collection('leaderboards').getFirstListItem(`quiz_id="${quizId}"`);
      await pb.collection('leaderboards').delete(leaderboard.id);
      await pb.collection('quizzes').delete(quizId);
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
      alert('Kvíz sikeresen törölve!');
    } catch (error) {
      console.error('Delete quiz error:', error);
      alert('Hiba történt a kvíz törlésekor.');
    }
  };

  return (
    <>
      {editingQuiz && (
        <Modal isOpen={!!editingQuiz} onClose={() => setEditingQuiz(null)}>
          <ModalContent>
            <ModalHeader>Kvíz szerkesztése</ModalHeader>
            <ModalBody>
              <div>
                <label>Kvíz leírása:</label>
                <Textarea
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Kategória:</label>
                <Select
                  placeholder="Válassz kategóriát"
                  value={category?.label || ''}
                  onChange={(e) => {
                    const selectedCategory = categories.find((cat) => cat.label === e.target.value);
                    setCategory(selectedCategory || null);
                  }}
                  renderValue={() =>
                    category && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {category.icon}
                        {category.label}
                      </span>
                    )
                  }
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.label} value={cat.label}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {cat.icon}
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label>Nehézség:</label>
                <Select
                  placeholder="Válassz nehézséget"
                  value={difficulty?.label || ''}
                  onChange={(e) => {
                    const selectedDifficulty = difficulties.find((diff) => diff.label === e.target.value);
                    setDifficulty(selectedDifficulty || null);
                  }}
                  renderValue={() =>
                    difficulty && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {difficulty.icon}
                        {difficulty.label}
                      </span>
                    )
                  }
                >
                  {difficulties.map((diff) => (
                    <SelectItem key={diff.label} value={diff.label}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {diff.icon}
                        {diff.label}
                      </span>
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleEditSubmit}>
                Mentés
              </Button>
              <Button color="danger" variant="light" onPress={() => setEditingQuiz(null)}>
                Mégsem
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <Modal isOpen={isOpen} onClose={onClose} style={{marginTop: '14rem'}}>
        <ModalContent>
          <ModalHeader>Kvízek</ModalHeader>
          <ModalBody>
            {loading ? (
              <div>Betöltés...</div>
            ) : quizzes.length === 0 ? (
              <div>Nincsenek kvízek.</div>
            ) : (
              <ul>
                {quizzes.map((quiz) => (
                  <div key={quiz.id}>
                    <li key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column',marginBottom: '0.75rem', marginTop: '0.75rem' }}>
                      <div>
                        <strong>ID:</strong> {quiz.id}
                      </div>
                      <div>
                        <strong>Kategória:</strong> {quiz.category}
                      </div>
                      <div>
                        <strong>Nehézség:</strong> {quiz.difficulty}
                      </div>
                      <div>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleEditQuiz(quiz)}
                          style={{ marginRight: '5px' }}
                        >
                          Szerkeszt
                        </Button>
                        <Button size="sm" color="danger" onPress={() => handleDelete(quiz.id)}>
                          Törlés
                        </Button>
                      </div>
                    </li>
                    <Divider className="my-4" style={{ background: 'red', height: '0.2rem' }} />
                  </div>
                ))}
              </ul>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Bezárás
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyQuizzesModal;
