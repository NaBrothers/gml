import express, { Request, Response } from 'express';
import { userDb, gameDb, gamePlayerDb, pointHistoryDb, calculateMahjongPoints, getRankByPoints, parseRankInfo } from '../utils/database.js';
import { ApiResponse, GameResult, GameDetail, Game } from '../../shared/types.js';

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

    // 创建对局记录
    const game = await gameDb.create({
      gameType,
      status: 'completed'
    });

    // 创建对局玩家记录和更新用户积分
    const gamePlayerPromises = players.map(async (playerId, index) => {
      const user = users[index]!;
      const calculation = calculations[index];
      
      // 记录积分变化前的状态
      const pointsBefore = user.totalPoints;
      const rankBeforeInfo = parseRankInfo(pointsBefore);
      const rankBefore = rankBeforeInfo.displayName;
      
      // 计算新积分和段位
      const pointsAfter = pointsBefore + calculation.rankPoints;
      const rankAfterInfo = parseRankInfo(pointsAfter);
      const rankAfter = rankAfterInfo.displayName;
      
      // 更新用户积分和段位
      await userDb.update(playerId, {
        totalPoints: pointsAfter,
        rankLevel: rankAfterInfo.rankConfig.rankOrder,
        gamesPlayed: user.gamesPlayed + 1
      });
      
      // 创建积分历史记录
      await pointHistoryDb.create({
        userId: playerId,
        gameId: game.id,
        pointsBefore,
        pointsAfter,
        pointsChange: calculation.rankPoints,
        rankBefore,
        rankAfter
      });
      
      // 创建对局玩家记录
      return await gamePlayerDb.create({
        gameId: game.id,
        userId: playerId,
        finalScore: calculation.finalScore,
        rawPoints: calculation.rawPoints,
        umaPoints: calculation.umaPoints,
        rankPointsChange: calculation.rankPoints,
        position: calculation.position
      });
    });

    const gamePlayers = await Promise.all(gamePlayerPromises);

    // 获取更新后的用户信息
    const updatedUsers = await Promise.all(players.map(playerId => userDb.findById(playerId)));
    
    // 为对局玩家添加用户信息
    const gamePlayersWithUsers = gamePlayers.map((gamePlayer, index) => ({
      ...gamePlayer,
      user: updatedUsers[index]
    }));

    const response: ApiResponse<{
      game: Game;
      players: typeof gamePlayersWithUsers;
      pointChanges: typeof calculations;
    }> = {
      success: true,
      data: {
        game,
        players: gamePlayersWithUsers,
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
        const playersWithUsers = await Promise.all(
          players.map(async (player) => {
            const user = await userDb.findById(player.userId);
            return { ...player, user };
          })
        );
        return { game, players: playersWithUsers };
      })
    );

    const response: ApiResponse<GameDetail[]> = {
      success: true,
      data: gamesWithPlayers
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
        error: '对局不存在'
      };
      return res.status(404).json(response);
    }

    const players = await gamePlayerDb.findByGameId(id);
    const playersWithUsers = await Promise.all(
      players.map(async (player) => {
        const user = await userDb.findById(player.userId);
        return { ...player, user };
      })
    );

    const response: ApiResponse<GameDetail> = {
      success: true,
      data: {
        game,
        players: playersWithUsers
      }
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