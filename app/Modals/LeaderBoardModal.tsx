
'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";
import pb from '../authentication/PocketBaseClient';
import PocketBase from 'pocketbase';
import { stringify } from 'querystring';

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

const LeaderBoardModal: React.FC<LeaderBoardModalProps> = ({ isOpen, quiz_id, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const pb = new PocketBase('http://127.0.0.1:8090');
  const Quize_c = ({ quizCode = fetchQuizzes}: any) => {
    console.log(quizCode)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        
        <span>{quizCode}</span>
          
      </div>
    );
  }; 

    const fetchQuizzes = async () => {
      
      setLoading(true);
      try {
        

        const record = await pb.collection('quizzes').getOne<Quiz>(quiz_id as string, {
          expand: 'relField1,relField2.subRelField'});
          return record
        
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    
    
    return (
      
      <>
        
        <Modal 
          backdrop="opaque" 
          isOpen={isOpen} 
          
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
                <ModalHeader className="flex flex-col gap-1">Legjobb eredmények: <Quize_c  /> </ModalHeader>
                 
                <ModalBody>
                <Table removeWrapper aria-label="Example static collection table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    <TableRow key="1">
                      <TableCell>Tony Reichert</TableCell>
                      <TableCell>CEO</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow key="2">
                      <TableCell>Zoey Lang</TableCell>
                      <TableCell>Technical Lead</TableCell>
                      <TableCell>Paused</TableCell>
                    </TableRow>
                    <TableRow key="3">
                      <TableCell>Jane Fisher</TableCell>
                      <TableCell>Senior Developer</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow key="4">
                      <TableCell>William Howard</TableCell>
                      <TableCell>Community Manager</TableCell>
                      <TableCell>Vacation</TableCell>
                    </TableRow>
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
