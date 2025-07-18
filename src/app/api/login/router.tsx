import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    //Steo 1: Extract data from the request body
    const { email, password } = await req.json();

    //Step 2: Fetch user by email
    const {data: user} = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    //Step 3: Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    //Step 4: Generate JWT token
    const token = jwt.sign(
        {userId: user.userId, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}    
    );

    //Step 5: Return success response with token
    return NextResponse.json(
        { message: 'Login successful', token },
        { status: 200 }     
    );
}