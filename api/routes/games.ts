import express, { Request, Response } from 'express';
import { userDb, gameDb, gamePlayerDb, pointHistoryDb, calculateMahjongPoints, getRankByPoints, parseRankInfo } from '../utils/database.js';
import { ApiResponse, GameResult, GameDetail, GameRecord, GamePlayerDetail } from '../../shared/types.js';

const router = express.Router();

// 创建对局记录
router.post('/', async (req: Request, res: Response) => {
  try {
    const { players, scores, gameType = '半庄' }: GameResult = req.body;

    // 验证输入
    if (!players || !scores || players.length !== 4 || scores.length !== 4) {
      const response: ApiResponse = {
        success: false,
        error: '必须提供4名玩家和对应的分值'
      };
      return res.status(400).json(response);
    }

    // 验证玩家是否存在
    const userPromises = players.map(playerId => userDb.findById(playerId));
    const users = await Promise.all(userPromises);
    
    if (users.some(user => !user)) {
      const response: ApiResponse = {
        success: false,
        error: '存在无效的玩家ID'
      };
      return res.status(400).json(response);
    }

    // 计算积分变化
    let calculations;
    try {
      calculations = calculateMahjongPoints(scores);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: (error as Error).message
      };
      return res.status(400).json(response);
    }

    // 创建对局玩家记录
    const gamePlayerRecords = players.map((playerId, index) => ({
      userId: playerId,
      finalScore: scores[index],
      position: calculations[index].position
    }));

    // 创建对局记录（使用新的简化结构）
    const game = await gameDb.create({
      gameType,
      players: gamePlayerRecords
    });

    // 获取详细的对局信息（包含计算后的数据）
    const gamePlayersWithDetails = await gamePlayerDb.findByGameId(game.id);

    const response: ApiResponse<{
      game: GameRecord;
      players: GamePlayerDetail[];
      pointChanges: typeof calculations;
    }> = {
      success: true,
      data: {
        game,
        players: gamePlayersWithDetails,
        pointChanges: calculations
      },
      message: '对局记录创建成功'
    };
    
    res.json(response);
  } catch (error) {
    console.error('创建对局记录失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '创建对局记录失败'
    };
    res.status(500).json(response);
  }
});

// 获取所有对局记录
router.get('/', async (req: Request, res: Response) => {
  try {
    const games = await gameDb.findAll();
    
    // 为每个对局获取玩家信息
    const gamesWithPlayers = await Promise.all(
      games.map(async (game) => {
        const players = await gamePlayerDb.findByGameId(game.id);
        return {
          game,
          players
        };
      })
    );

    const response: ApiResponse<GameDetail[]> = {
      success: true,
      data: gamesWithPlayers,
      message: '获取对局记录成功'
    };
    res.json(response);
  } catch (error) {
    console.error('获取对局记录失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取对局记录失败'
    };
    res.status(500).json(response);
  }
});

// 根据ID获取对局详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const game = await gameDb.findById(id);
    if (!game) {
      const response: ApiResponse = {
        success: false,
        error: '对局记录不存在'
      };
      return res.status(404).json(response);
    }

    const players = await gamePlayerDb.findByGameId(id);
    
    const gameDetail: GameDetail = {
      game,
      players
    };

    const response: ApiResponse<GameDetail> = {
      success: true,
      data: gameDetail,
      message: '获取对局详情成功'
    };
    res.json(response);
  } catch (error) {
    console.error('获取对局详情失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取对局详情失败'
    };
    res.status(500).json(response);
  }
});

export default router;