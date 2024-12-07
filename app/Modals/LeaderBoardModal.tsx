
'use client';

import React, { JSXElementConstructor, ReactElement, useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import pb from '../authentication/PocketBaseClient';
import PocketBase from 'pocketbase';
import { stringify } from 'querystring';
import { useAuth } from '../authentication/AuthContext';

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

interface LeaderBoardModalProps {
  isOpen: boolean;
  quiz_id: string|null;
  onClose: () => void;
}

class QuizLeaderboardData {
  public quiz: any;
  public scores: any[] = [];
}

export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto'

const getQuizData = async (id : string) => {
  try{
    let dquiz = await pb.collection('quizzes').getOne(
      id,
      { expand: 'creator'}
    );

    let dscores = await pb.collection('scores').getList(1, 10, 
      { filter: `quiz_id~"${id}"`, sort: '-score', expand: 'user_id'}
    );
    let d = new QuizLeaderboardData();
    d.quiz = dquiz;
    d.scores = dscores.items;
    return d;
  }
  catch(error: any){
    return null;
  }
};

const LeaderBoardModal: React.FC<LeaderBoardModalProps> = ({ isOpen, quiz_id, onClose }) => {
  const { user, loading } = useAuth();
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizData, setQuizData] = useState<QuizLeaderboardData>();

  useEffect(() => {
    if (isOpen && user) {
      loadPage();
    }
  }, [user, isOpen]);

  const loadPage = async () => {
    try{
      if(quiz_id == null)
        return;
      let id = quiz_id;
      let d = await getQuizData(id) ?? undefined;
      setQuizData(d);
    }
    catch (error) {
      console.error('Quiz fetch hiba:', error);
    }
    finally {
      setQuizLoading(false);
    }
  }


    return (
      <>
        <Modal 
          backdrop="opaque" 
          isOpen={isOpen} 
          onClose={onClose}
          
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              },
              exit: {
                y: -20,
                opacity: 0,
                transition: {
                  duration: 0.2,
                  ease: "easeIn",
                },
              },
            }
          }}
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">Legjobb eredmények: {quizData?.quiz.quiz_code}</ModalHeader>
                 
                <ModalBody>
                <Table removeWrapper aria-label="Example static collection table">
                  <TableHeader>
                    <TableColumn>#</TableColumn>
                    <TableColumn>Név</TableColumn>
                    <TableColumn>Helyes válaszok</TableColumn>
                    <TableColumn>Pontszám</TableColumn>
                  </TableHeader>

                  
                  <TableBody>
                    {
                      quizData?.scores.map((score : any, index : number) => {
                        return (
                          <TableRow key={index + 1}>
                            <TableCell>{index + 1}.</TableCell>
                            <TableCell>{score.expand.user_id.username}</TableCell>
                            <TableCell>{score.correct_answers}</TableCell>
                            <TableCell>{score.score}</TableCell>
                          </TableRow>
                        );
                      }) ?? []
                    }
                  </TableBody>
                </Table>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
    
  

 
};
export default LeaderBoardModal
