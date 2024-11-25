'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  Textarea,
  SelectItem,
  Divider
} from "@nextui-org/react";
import { useAuth } from '../authentication/AuthContext';
import pb from '../authentication/PocketBaseClient';
import { MdiPlus } from '../assets/SvgIcons';
import styles from './CreateQuizModal.module.css';
import * as icons from '../assets/SvgIcons';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [quizDescription, setQuizDescription] = useState('');
  const [category, setCategory] = useState<{ label: string; icon: JSX.Element } | null>(null);
  const [difficulty, setDifficulty] = useState<{ label: string; icon: JSX.Element } | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearQuiz = () => {
    setQuizDescription('');
    setCategory(null);
    setDifficulty(null);
    setQuestions([]);
    setAnswers([]);
    setCorrectAnswer([]);
  };

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

  const generateQuizCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
    setAnswers([...answers, '']);
    setCorrectAnswer([...correctAnswer, '']);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    const newAnswers = [...answers];
    const newCorrectAnswer = [...correctAnswer];

    newQuestions.splice(index, 1);
    newAnswers.splice(index, 1);
    newCorrectAnswer.splice(index, 1);

    setQuestions(newQuestions);
    setAnswers(newAnswers);
    setCorrectAnswer(newCorrectAnswer);
  };

  const updateQuestion = (index: number, field: 'question' | 'answers' | 'correctAnswer', value: string) => {
    if (field === 'question') {
      const newQuestions = [...questions];
      newQuestions[index] = value;
      setQuestions(newQuestions);
    } else if (field === 'answers') {
      const newAnswers = [...answers];
      newAnswers[index] = value;
      setAnswers(newAnswers);
    } else if (field === 'correctAnswer') {
      const newCorrectAnswer = [...correctAnswer];
      newCorrectAnswer[index] = value;
      setCorrectAnswer(newCorrectAnswer);
    }
  };

  const handleSubmit = async () => {
    const combinedQuestions = questions.map((question, index) => ({
      question_text: question,
      answers: answers[index],
      correct_answer: correctAnswer[index],
    }));

    if (!quizDescription || !category || !difficulty) {
      alert('Kérjük, töltsd ki az összes kötelező mezőt.');
      return;
    }

    for (let i = 0; i < combinedQuestions.length; i++) {
      const q = combinedQuestions[i];
      if (!q.question_text || !q.answers || !q.correct_answer) {
        alert(`Kérjük, töltsd ki az összes mezőt a(z) ${i + 1}. kérdéshez.`);
        return;
      }

      const answersArray = q.answers.split(',').map(ans => ans.trim());
      if (answersArray.length < 1 || answersArray.length > 4) {
        alert(`A(z) ${i + 1}. kérdéshez 1 és 4 közötti válaszlehetőséget kell megadnod.`);
        return;
      }
      if (!answersArray.includes(q.correct_answer.trim())) {
        alert(`A(z) ${i + 1}. kérdéshez megadott helyes válasz nem szerepel a válaszok között.`);
        return;
      }
      const correctAnswersCount = answersArray.filter(ans => ans === q.correct_answer.trim()).length;
      if (correctAnswersCount !== 1) {
        alert(`A(z) ${i + 1}. kérdéshez pontosan egy helyes választ kell megadni.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const quizCode = generateQuizCode();
      const numberOfQuestions = combinedQuestions.length;

      const quizData = {
        quiz_code: quizCode,
        quiz_description: quizDescription,
        number_of_questions: numberOfQuestions,
        category: category?.label || '',
        difficulty: difficulty?.label || '',
        questions: JSON.stringify(combinedQuestions.map(q => q.question_text)),
        answers: JSON.stringify(combinedQuestions.map(q => q.answers.split(',').map(ans => ans.trim()))),
        correct_answers: JSON.stringify(combinedQuestions.map(q => q.correct_answer.trim())),
        creator: user?.id || '',
      };

      const createdQuiz = await pb.collection('quizzes').create(quizData);

      const leaderboardData = {
        quiz_id: createdQuiz.id,
        players_and_scores: JSON.stringify([]),
      };

      await pb.collection('leaderboards').create(leaderboardData);

      alert('Kvíz sikeresen létrehozva!');
      window.location.reload();
      clearQuiz();
      onClose();
    } catch (error) {
      console.error('Kvíz létrehozási hiba:', error);
      alert('Hiba történt a kvíz létrehozása során.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalOnClose = () => {
    clearQuiz();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={modalOnClose} closeButton className={styles.modalWindow}>
      <ModalContent className={styles.modalContent}>
        <ModalHeader>Létrehozás</ModalHeader>
        <ModalBody className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label htmlFor="quiz-description">Kvíz leírása (min. 10, max. 400 karakter):</label>
            <Textarea
              id="quiz-description"
              placeholder="Írj egy leírást a kvízedhez..."
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              required
              className={styles.textarea}
              aria-label="Kvíz leírása"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category">Kategória:</label>
            <Select
              id="category"
              placeholder="Válaszd ki a kategóriát"
              value={category?.label || ''}
              onChange={(e) => {
                const selectedCategory = categories.find(cat => cat.label === e.target.value);
                setCategory(selectedCategory || null);
              }}
              required
              className={styles.select}
              aria-label="Kategória kiválasztása"
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
                <SelectItem key={cat.label} value={cat.label} textValue={cat.label}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {cat.icon}
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className={styles.formGroup}>
            <label>Nehézség:</label>
            <Select
              placeholder="Válassz nehézséget"
              value={difficulty?.label || ''}
              onChange={(e) => {
                const selectedDifficulty = difficulties.find(diff => diff.label === e.target.value);
                setDifficulty(selectedDifficulty || null);
              }}
              required
              className={styles.select}
              aria-label="Nehézség kiválasztása"
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
                <SelectItem key={diff.label} value={diff.label} textValue={diff.label}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {diff.icon}
                    {diff.label}
                  </span>
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className={styles.questionsSection}>
            <h3>Kérdések:</h3>
            {questions.map((_, index) => (
              <div key={index} className={styles.questionGroup}>
                <div className={styles.formGroup}>
                  <label htmlFor={`question-text-${index}`}>Kérdés {index + 1}:</label>
                  <Input
                    id={`question-text-${index}`}
                    placeholder="Írd be a kérdést..."
                    value={questions[index]}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    required
                    className={styles.input}
                    aria-label={`Kérdés ${index + 1}`}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor={`answers-${index}`}>Válaszok (vesszővel elválasztva, maximum 4):</label>
                  <Input
                    id={`answers-${index}`}
                    placeholder="Válasz1, Válasz2, Válasz3, Válasz4"
                    value={answers[index]}
                    onChange={(e) => updateQuestion(index, 'answers', e.target.value)}
                    required
                    className={styles.input}
                    aria-label={`Válaszok a ${index + 1}. kérdéshez`}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor={`correct-answer-${index}`}>Helyes válasz(maximum 1):</label>
                  <Input
                    id={`correct-answer-${index}`}
                    placeholder="Írd be a helyes választ..."
                    value={correctAnswer[index]}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    required
                    className={styles.input}
                    aria-label={`Helyes válasz a ${index + 1}. kérdéshez`}
                  />
                </div>
                {questions.length > 1 && (
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className={styles.removeButton}
                    aria-label={`Kérdés ${index + 1} törlése`}
                  >
                    Törlés
                  </Button>
                )}
                <Divider className={styles.questionDivider} />
              </div>
            ))}
            <Button
              color="primary"
              onClick={addQuestion}
              className={styles.addButton}
              startContent={<MdiPlus />}
              aria-label="Több kérdés hozzáadása"
            >
              Több kérdés hozzáadása
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onPress={handleSubmit}
            disabled={isSubmitting}
            aria-label="Kvíz létrehozása"
          >
            {isSubmitting ? 'Küldés...' : 'Létrehozás'}
          </Button>
          <Button
            color="danger"
            variant="light"
            onPress={modalOnClose}
            disabled={isSubmitting}
            aria-label="Mégsem"
          >
            Mégsem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateQuizModal;