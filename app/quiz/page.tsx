'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../authentication/AuthContext';
import './quizpage.css';
import Header from "../header/Header";
import pb from '../authentication/PocketBaseClient';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Pagination } from "@nextui-org/react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categories } from './categories';

export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto'

const getQuizzes = async (page: number = 1, filter: string = '') => {
  const perPage = 12;
  const data = await pb.collection('quizzes').getList(page, perPage, {
    filter: filter,
    expand: 'creator',
  });
  return data;
};

export default function QuizPage() {
  const { user } = useAuth();

  return (
    <>
      <Header quizMainHeaderMode={true} />
      <div className='main-container'>
        <Suspense fallback={<div><h1><p>Betöltés...</p></h1></div>}>
          <QuizContent user={user} />
        </Suspense>
      </div>
    </>
  );
}

interface QuizContentProps {
  user: any;
}

function QuizContent({ user }: QuizContentProps) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const loadQuizzes = async (page: number = 1, searchQuery: string = '') => {
    try {
      let filter = '';
      if (searchQuery) {
        const hasUppercase = /[A-Z]/.test(searchQuery);
        if (hasUppercase) {
          filter = `quiz_code="${searchQuery}"`;
        } else {
          filter = `category~"${searchQuery}"`;
        }
      }
      const data = await getQuizzes(page, filter);
      setQuizzes(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Quizzes fetch hiba:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setCurrentPage(1); // Kereséskor visszaállunk az első oldalra
    }
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      setQuizLoading(true);
      loadQuizzes(currentPage, searchQuery);
    }
  }, [user, currentPage, searchQuery]);

  // Ha az oldal vagy a kvízek betöltődnek
  if (quizLoading) return (<div><h1><p>Betöltés...</p></h1></div>);

  // Ha nincs bejelentkezve a felhasználó
  if (!user) return null;

  const getBackgroundColor = (difficulty: string) => {
    switch (difficulty) {
      case "Könnyű":
        return '#00ff32'; // Zöld - könnyű
      case "Közepes":
        return '#FFC300'; // Sárga - közepes
      case "Nehéz":
        return '#FF1500'; // Piros - nehéz
      default:
        return '#8a8884'; // Alapértelmezett szürke
    }
  }

  return (
    <div className='quiz-page-container'>
      <div className='secondary-container'>
        {quizzes.map((quiz) => (
          <Card className='m-2 quiz-card' shadow="sm" key={quiz.id}>
            <CardHeader
              className='difficulty-chip-div'
              style={{
                background: getBackgroundColor(quiz.difficulty),
              }}>
              <div>
                {categories.map((cat) =>
                  cat.label === quiz.category ? (
                    <div key={cat.label} title={cat.label}>
                      {cat.icon}
                    </div>
                  ) : null
                )}
              </div>
              <div>
                <Chip>{quiz.difficulty}</Chip>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible p-0">
              <div className='m-2 quiz-description'>
                <p className='text-small font-bold'>Készítő: {quiz.expand ? quiz.expand.creator.username : 'default'}</p>
                <div className='flex flex-row justify-between'>
                  <h3 className='text-small font-bold'>Kérdések száma: {quiz.number_of_questions}</h3>
                  <p className='text-small font-bold' style={{ marginRight: '0.5rem' }}>Kvíz kód: {quiz.quiz_code}</p>
                </div>
                <Divider className="my-4" style={{ background: getBackgroundColor(quiz.difficulty), height: '0.2rem' }} />
                <p className="text-small mt-1">{quiz.quiz_description}</p>
              </div>
            </CardBody>
            <CardFooter className='quiz-card-footer'>
              <div>
                <Link href={`/quiz/${quiz.id}`} passHref>
                  <Button className='mr-1' color='primary' as="a">
                    <span>Kitöltés (wip)</span>
                  </Button>
                </Link>
              </div>
              <div>
                <Button className='ml-1' isDisabled color='secondary'>
                  <span>Ranglista (wip)</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className='pagination-container'>
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={(page) => setCurrentPage(page)}
          color={"warning"}
        />
      </div>
    </div>
  );
}