import { NextRequest, NextResponse } from 'next/server';
import { DatabaseStorage } from '@/lib/storage/DatabaseStorage';
import type { Election } from '@/lib/voting';

// POST /api/elections - Save election to database
export async function POST(request: NextRequest) {
  try {
    const election: Election = await request.json();

    // Save to database
    await DatabaseStorage.saveElection(election);

    console.log(`[API] Saved election to database: ${election.title}`);

    return NextResponse.json({
      success: true,
      message: 'Election saved to database',
      electionId: election.id
    });
  } catch (error: any) {
    console.error('[API] Error saving election:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/elections?schoolId=xxx - Get all elections
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId') || undefined;

    const elections = await DatabaseStorage.getAllElections(schoolId);

    return NextResponse.json({
      success: true,
      elections
    });
  } catch (error: any) {
    console.error('[API] Error fetching elections:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/elections?id=xxx - Delete election
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Election ID is required' },
        { status: 400 }
      );
    }

    await DatabaseStorage.deleteElection(id);

    console.log(`[API] Deleted election from database: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Election deleted from database'
    });
  } catch (error: any) {
    console.error('[API] Error deleting election:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
