import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST (req: NextRequest) {
    //Step 1: Extract data from the request body
    const { email, password, name } = await req.json();

    //Step 2: Check if the email is already registered
    const {data: existingUser} = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    //Step 3: Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Step 4: Insert the new user into the database
    const { error } = await supabase
        .from('users')
        .insert({ email, password: hashedPassword, name });

    if (error) {
        // Step 5: Handle any errors during insertion
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Step 6: Return a success response
    return NextResponse.json({ message: 'User registered successfully' });
}