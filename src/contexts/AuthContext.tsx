
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, FamilyMember } from '@/types';

interface AuthContextType {
  user: User | null;
  familyMembers: FamilyMember[];
  currentProfile: User | FamilyMember;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (phone: string, otp: string) => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  switchProfile: (profileId: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentProfile, setCurrentProfile] = useState<User | FamilyMember | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('healthlens_user');
    const savedFamily = localStorage.getItem('healthlens_family');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setCurrentProfile(userData);
    }
    
    if (savedFamily) {
      setFamilyMembers(JSON.parse(savedFamily));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData: User = {
      id: '1',
      name: 'John Doe',
      email,
      age: 30,
      chronicConditions: ['Diabetes', 'Hypertension']
    };
    
    setUser(userData);
    setCurrentProfile(userData);
    localStorage.setItem('healthlens_user', JSON.stringify(userData));
  };

  const loginWithOTP = async (phone: string, otp: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userData: User = {
      id: '1',
      name: 'John Doe',
      email: `${phone}@healthlens.app`,
      age: 30
    };
    
    setUser(userData);
    setCurrentProfile(userData);
    localStorage.setItem('healthlens_user', JSON.stringify(userData));
  };

  const signup = async (userData: Partial<User>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      age: userData.age,
      chronicConditions: userData.chronicConditions || []
    };
    
    setUser(newUser);
    setCurrentProfile(newUser);
    localStorage.setItem('healthlens_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setCurrentProfile(null);
    setFamilyMembers([]);
    localStorage.removeItem('healthlens_user');
    localStorage.removeItem('healthlens_family');
  };

  const switchProfile = (profileId: string) => {
    if (profileId === user?.id) {
      setCurrentProfile(user);
    } else {
      const member = familyMembers.find(m => m.id === profileId);
      if (member) {
        setCurrentProfile(member);
      }
    }
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString()
    };
    
    const updatedFamily = [...familyMembers, newMember];
    setFamilyMembers(updatedFamily);
    localStorage.setItem('healthlens_family', JSON.stringify(updatedFamily));
  };

  return (
    <AuthContext.Provider value={{
      user,
      familyMembers,
      currentProfile: currentProfile || user!,
      isAuthenticated: !!user,
      login,
      loginWithOTP,
      signup,
      logout,
      switchProfile,
      addFamilyMember
    }}>
      {children}
    </AuthContext.Provider>
  );
};
