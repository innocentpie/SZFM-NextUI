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

export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto';

const getQuizzes = async (page: number = 1, filter: string = '') => {
  const perPage = 12;
  const data = await pb.collection('verifiedQuizzes').getList(page, perPage, {
    sort: '-created',
    filter: filter,
    expand: 'quiz_id,quiz_id.creator',
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
        filter = `quiz_id.quiz_code~"${searchQuery}" 
        || quiz_id.category~"${searchQuery}" 
        || quiz_id.difficulty~"${searchQuery}" 
        || quiz_id.creator.username~"${searchQuery}"`;
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
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      setQuizLoading(true);
      loadQuizzes(currentPage, searchQuery);
    }
  }, [user, currentPage, searchQuery]);

  if (quizLoading) return (<div><h1><p>Betöltés...</p></h1></div>);

  if (!user) return null;

  const getBackgroundColor = (difficulty: string) => {
    switch (difficulty) {
      case "Könnyű":
        return '#00ff32';
      case "Közepes":
        return '#FFC300';
      case "Nehéz":
        return '#FF1500';
      default:
        return '#8a8884';
    }
  };

  return (
    <div className='quiz-page-container'>
      <div className='secondary-container'>
        {quizzes.map((quiz) => (
          <Card className='m-2 quiz-card' shadow="sm" key={quiz.id}>
            <CardHeader
              className='difficulty-chip-div'
              style={{
                background: getBackgroundColor(quiz.expand.quiz_id.difficulty),
              }}>
              <div>
                {categories.map((cat) =>
                  cat.label === quiz.expand.quiz_id.category ? (
                    <div key={cat.label} title={cat.label}>
                      {cat.icon}
                    </div>
                  ) : null
                )}
              </div>
              <div>
                <Chip>{quiz.expand.quiz_id.difficulty}</Chip>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible p-0">
              <div className='m-2 quiz-description'>
                <p className='text-small font-bold'>
                  Készítő: {quiz.expand.quiz_id.creator ? quiz.expand.quiz_id.expand.creator.username : 'Ismeretlen'}
                </p>
                <div className='flex flex-row justify-between'>
                  <h3 className='text-small font-bold'>Kérdések száma: {quiz.expand.quiz_id.number_of_questions}</h3>
                  <p className='text-small font-bold' style={{ marginRight: '0.5rem' }}>Kvíz kód: {quiz.expand.quiz_id.quiz_code}</p>
                </div>
                <Divider className="my-4" style={{ background: getBackgroundColor(quiz.expand.quiz_id.difficulty), height: '0.2rem' }} />
                <p className="text-small mt-1">{quiz.expand.quiz_id.quiz_description}</p>
              </div>
            </CardBody>
            <CardFooter className='quiz-card-footer'>
              <div>
                <Link href={`/quiz/${quiz.expand.quiz_id.id}`} passHref>
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